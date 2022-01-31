import { photos } from '@internxt/sdk';
import strings from '../../../assets/lang/strings';
import { RootState } from '../../store';
import RNFS from 'react-native-fs';

import { PhotosServiceModel, PhotosSyncInfo, PhotosSyncTaskType, PhotosTaskCompletedInfo } from '../../types/photos';
import PhotosDeviceService from './PhotosDeviceService';
import PhotosCameraRollService from './PhotosCameraRollService';
import PhotosDownloadService from './PhotosDownloadService';
import PhotosLocalDatabaseService from './PhotosLocalDatabaseService';
import PhotosLogService from './PhotosLogService';
import PhotosUploadService from './PhotosUploadService';
import { items } from '@internxt/lib';
import PhotosFileSystemService from './PhotosFileSystemService';

export default class PhotosSyncService {
  private readonly model: PhotosServiceModel;
  private readonly photosSdk: photos.Photos;

  private readonly deviceService: PhotosDeviceService;
  private readonly cameraRollService: PhotosCameraRollService;
  private readonly uploadService: PhotosUploadService;
  private readonly downloadService: PhotosDownloadService;
  private readonly localDatabaseService: PhotosLocalDatabaseService;
  private readonly logService: PhotosLogService;
  private readonly fileSystemService: PhotosFileSystemService;

  private currentSyncId = '';

  constructor(
    model: PhotosServiceModel,
    photosSdk: photos.Photos,
    deviceService: PhotosDeviceService,
    cameraRollService: PhotosCameraRollService,
    uploadService: PhotosUploadService,
    downloadService: PhotosDownloadService,
    localDatabaseService: PhotosLocalDatabaseService,
    logService: PhotosLogService,
    fileSystemService: PhotosFileSystemService,
  ) {
    this.model = model;
    this.photosSdk = photosSdk;
    this.deviceService = deviceService;
    this.cameraRollService = cameraRollService;
    this.uploadService = uploadService;
    this.downloadService = downloadService;
    this.localDatabaseService = localDatabaseService;
    this.logService = logService;
    this.fileSystemService = fileSystemService;
  }

  public async run(options: {
    id?: string;
    signal?: AbortSignal;
    getState: () => RootState;
    onStart?: (tasksInfo: PhotosSyncInfo) => void;
    onTaskCompleted?: (result: {
      taskType: PhotosSyncTaskType;
      photo: photos.Photo;
      completedTasks: number;
      info: PhotosTaskCompletedInfo;
    }) => void;
    onStorageLimitReached: () => void;
  }): Promise<void> {
    try {
      this.currentSyncId = options.id || new Date().getTime().toString();

      let completedTasks = 0;
      const onTaskCompletedFactory =
        (taskType: PhotosSyncTaskType) => (photo: photos.Photo, info: PhotosTaskCompletedInfo) => {
          completedTasks++;
          options.onTaskCompleted?.({ taskType, photo, completedTasks, info });
        };

      this.logService.info(`[SYNC-MAIN] ${this.currentSyncId}: STARTED`);

      if (!this.model.user) {
        throw new Error('photos user not initialized');
      }

      if (!this.model.device) {
        throw new Error('photos device not initialized');
      }

      await this.deviceService.initialize();

      const { count: cameraRollCount } = await this.cameraRollService.copyToLocalDatabase();
      this.logService.info(`[SYNC] ${this.currentSyncId}: COPIED ${cameraRollCount} EDGES FROM CAMERA ROLL TO SQLITE`);

      const syncInfo = await this.calculateSyncInfo();
      options.onStart?.(syncInfo);
      this.logService.info(
        `[SYNC] ${this.currentSyncId}: CALCULATED ${syncInfo.totalTasks} TASKS: ${syncInfo.downloadTasks} downloadTasks, ${syncInfo.newerUploadTasks} newerUploadTasks, ${syncInfo.olderUploadTasks} olderUploadTasks`,
      );

      await this.downloadRemotePhotos({
        signal: options.signal,
        onPhotoDownloaded: onTaskCompletedFactory(PhotosSyncTaskType.Download),
      });
      this.logService.info(`[SYNC] ${this.currentSyncId}: REMOTE PHOTOS DOWNLOADED`);

      const newestDate = await this.localDatabaseService.getNewestDate();
      const oldestDate = await this.localDatabaseService.getOldestDate();

      await this.uploadLocalPhotos(this.model.user.id, this.model.device.id, {
        signal: options.signal,
        from: newestDate,
        getState: options.getState,
        onStorageLimitReached: options.onStorageLimitReached,
        onPhotoUploaded: onTaskCompletedFactory(PhotosSyncTaskType.Upload),
      });
      this.logService.info(`[SYNC] ${this.currentSyncId}: NEWER LOCAL PHOTOS UPLOADED`);

      if (!oldestDate) {
        this.logService.info(`[SYNC] ${this.currentSyncId}: SKIPPED OLDER LOCAL PHOTOS UPLOAD`);
      } else {
        await this.uploadLocalPhotos(this.model.user.id, this.model.device.id, {
          signal: options.signal,
          to: oldestDate,
          getState: options.getState,
          onStorageLimitReached: options.onStorageLimitReached,
          onPhotoUploaded: onTaskCompletedFactory(PhotosSyncTaskType.Upload),
        });
        this.logService.info(`[SYNC] ${this.currentSyncId}: OLDER LOCAL PHOTOS UPLOADED`);
      }

      if (options.signal?.aborted) {
        this.logService.info(`[SYNC] ${this.currentSyncId}: ABORTED`);
      } else {
        this.logService.info(`[SYNC] ${this.currentSyncId}: FINISHED`);
      }
    } catch (err) {
      this.logService.info(`[SYNC] ${this.currentSyncId}: FAILED:` + err);
      throw err;
    } finally {
      await this.localDatabaseService.cleanTmpCameraRollTable();
      await this.fileSystemService.clearTmp();

      this.logService.info(`[SYNC] ${this.currentSyncId}: FINALLY CLEANED TMP DATA FROM FS AND SQLITE`);
    }
  }

  private async calculateSyncInfo(): Promise<PhotosSyncInfo> {
    const remoteSyncAt = await this.localDatabaseService.getRemoteSyncAt();
    const newestDate = await this.localDatabaseService.getNewestDate();
    const oldestDate = await this.localDatabaseService.getOldestDate();
    const { count: downloadTasks } = await this.photosSdk.photos.getPhotos({ statusChangedAt: remoteSyncAt });
    const newerUploadTasks = await this.localDatabaseService.countTmpCameraRoll({ from: newestDate });
    const olderUploadTasks = oldestDate ? await this.localDatabaseService.countTmpCameraRoll({ to: oldestDate }) : 0;

    return {
      totalTasks: downloadTasks + newerUploadTasks + olderUploadTasks,
      downloadTasks,
      newerUploadTasks,
      olderUploadTasks,
    };
  }

  /**
   * @description Downloads remote photos whose status changed after the last update
   */
  private async downloadRemotePhotos(options: {
    signal?: AbortSignal;
    onPhotoDownloaded: (photo: photos.Photo, info: PhotosTaskCompletedInfo) => void;
  }): Promise<void> {
    const remoteSyncAt = await this.localDatabaseService.getRemoteSyncAt();
    const now = new Date();
    const limit = 25;
    let skip = 0;
    let photos;

    this.logService.info(`[SYNC] ${this.currentSyncId}: LAST SYNC WAS AT ${remoteSyncAt.toUTCString()}`);

    do {
      const { results } = await this.photosSdk.photos.getPhotos({ statusChangedAt: remoteSyncAt }, skip, limit);

      photos = results;

      for (const photo of photos) {
        // * Stops execution if sync was aborted
        if (options.signal?.aborted) {
          return;
        }

        const isAlreadyOnTheDevice = !!(await this.localDatabaseService.getPhotoById(photo.id));

        this.logService.info('Photo ' + photo.name + ' is on the device? ' + isAlreadyOnTheDevice);

        if (isAlreadyOnTheDevice) {
          await this.localDatabaseService.updatePhotoStatusById(photo.id, photo.status);
        } else {
          const previewPath = await this.downloadService.downloadPhoto(photo);
          await this.localDatabaseService.insertPhoto(photo, previewPath);
        }

        options.onPhotoDownloaded(photo, { isAlreadyOnTheDevice });
      }

      skip += limit;
    } while (photos.length === limit);

    /**
     * BE CAREFUL WITH CONCURRENCY
     *
     * This date should be as precise as possible without excluding any remote
     * photo. Is better to realize and skip that 3 or 4 photos already synced
     * because you store the date where you begin to sync (so concurrent uploads
     * from other devices could be already downloaded by you) instead of skipping
     * photos forever. In the moment where this date is newer that a photo not
     * downloaded, this photo will be ignored until its state changes.
     *
     * To avoid this issue but keep using an efficient way to sync supported by
     * dates and acoted ranges, try to avoid skipping anything
     */
    await this.localDatabaseService.setRemoteSyncAt(now);
  }

  /**
   * @description Uploads new local photos
   */
  async uploadLocalPhotos(
    userId: photos.UserId,
    deviceId: photos.DeviceId,
    options: {
      signal?: AbortSignal;
      from?: Date;
      to?: Date;
      getState: () => RootState;
      onStorageLimitReached: () => void;
      onPhotoUploaded: (photo: photos.Photo, info: PhotosTaskCompletedInfo) => void;
    },
  ): Promise<void> {
    const limit = 50;
    let skip = 0;
    let photosToUpload: { data: Omit<photos.CreatePhotoData, 'fileId' | 'previewId' | 'hash'>; uri: string }[];

    this.logService.info(`[SYNC] ${this.currentSyncId}: UPLOADING LOCAL PHOTOS FROM ${options.from} TO ${options.to}`);

    do {
      const cameraRollPhotos = await this.localDatabaseService.getTmpCameraRollPhotos({
        from: options.from,
        to: options.to,
        limit,
        skip,
      });

      photosToUpload = cameraRollPhotos.map<{
        data: Omit<photos.CreatePhotoData, 'fileId' | 'previewId' | 'hash'>;
        uri: string;
      }>((p) => {
        const nameWithExtension = p.filename as string;
        const nameWithoutExtension = nameWithExtension.substring(0, nameWithExtension.lastIndexOf('.'));
        const nameSplittedByDots = nameWithExtension.split('.');
        const extension = nameSplittedByDots[nameSplittedByDots.length - 1] || '';

        return {
          data: {
            takenAt: new Date(p.timestamp),
            userId: userId,
            deviceId: deviceId,
            height: p.height,
            width: p.width,
            size: p.fileSize as number,
            type: extension,
            name: nameWithoutExtension,
          },
          uri: p.uri,
        };
      });

      for (const photo of photosToUpload) {
        // * Stops execution if sync was aborted
        if (options.signal?.aborted) {
          return;
        }

        const usage = options.getState().storage.usage + options.getState().photos.usage;
        const limit = options.getState().storage.limit;
        const hash = await RNFS.hash(photo.uri, 'sha256');
        const isAlreadyUploaded = await this.localDatabaseService.getPhotoByNameTypeDeviceAndHash(
          photo.data.name,
          photo.data.type,
          photo.data.deviceId,
          hash,
        );

        // * Avoids to upload the same photo multiple times
        if (isAlreadyUploaded) {
          this.logService.info(
            `[SYNC] ${this.currentSyncId}: ${items.getItemDisplayName(photo.data)} IS ALREADY UPLOADED, SKIPPING`,
          );
        } else {
          if (photo.data.size + usage > limit) {
            options.onStorageLimitReached();
            throw new Error(strings.errors.storageLimitReached);
          }

          const [createdPhoto, preview] = await this.uploadService.upload({ ...photo.data, hash }, photo.uri);

          await this.localDatabaseService.insertPhoto(createdPhoto, preview);

          options.onPhotoUploaded?.(createdPhoto, { isAlreadyOnTheDevice: false });
        }
      }

      skip += limit;
    } while (photosToUpload.length > 0);
  }
}
