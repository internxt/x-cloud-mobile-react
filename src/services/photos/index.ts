import { photos } from '@internxt/sdk';

import { NetworkCredentials } from '../../types';
import { PhotosServiceModel, PhotosSyncInfo, PhotosSyncTaskType, PhotosTaskCompletedInfo } from '../../types/photos';
import PhotosLocalDatabaseService from './PhotosLocalDatabaseService';
import PhotosUploadService from './PhotosUploadService';
import PhotosDeleteService from './PhotosDeleteService';
import PhotosSyncService from './PhotosSyncService';
import PhotosCameraRollService from './PhotosCameraRollService';
import PhotosDownloadService from './PhotosDownloadService';
import PhotosDeviceService from './PhotosDeviceService';
import PhotosUserService from './PhotosUserService';
import PhotosLogService from './PhotosLogService';
import PhotosFileSystemService from './PhotosFileSystemService';
import PhotosUsageService from './PhotosUsageService';
import { RootState } from '../../store';

export class PhotosService {
  private readonly model: PhotosServiceModel;
  private readonly photosSdk: photos.Photos;

  private readonly logService: PhotosLogService;
  private readonly fileSystemService: PhotosFileSystemService;
  private readonly cameraRollService: PhotosCameraRollService;
  private readonly localDatabaseService: PhotosLocalDatabaseService;
  private readonly usageService: PhotosUsageService;
  private readonly deviceService: PhotosDeviceService;
  private readonly userService: PhotosUserService;
  private readonly uploadService: PhotosUploadService;
  private readonly downloadService: PhotosDownloadService;
  private readonly deleteService: PhotosDeleteService;
  private readonly syncService: PhotosSyncService;

  constructor(accessToken: string, networkCredentials: NetworkCredentials) {
    this.model = {
      debug: process.env.NODE_ENV !== 'production',
      isInitialized: false,
      accessToken,
      networkCredentials,
      networkUrl: process.env.REACT_NATIVE_PHOTOS_NETWORK_API_URL || '',
    };
    this.photosSdk = new photos.Photos('http://172.25.210.8:8000/api' || '', accessToken);

    this.logService = new PhotosLogService(this.model);
    this.fileSystemService = new PhotosFileSystemService(this.model, this.logService);
    this.localDatabaseService = new PhotosLocalDatabaseService(this.model, this.logService);
    this.cameraRollService = new PhotosCameraRollService(this.logService, this.localDatabaseService);
    this.usageService = new PhotosUsageService(this.model);
    this.deviceService = new PhotosDeviceService(
      this.model,
      this.photosSdk,
      this.localDatabaseService,
      this.logService,
    );
    this.userService = new PhotosUserService(this.model, this.photosSdk, this.deviceService, this.logService);
    this.uploadService = new PhotosUploadService(this.model, this.photosSdk, this.logService, this.fileSystemService);
    this.downloadService = new PhotosDownloadService(this.model, this.localDatabaseService, this.logService);
    this.deleteService = new PhotosDeleteService(
      this.model,
      this.photosSdk,
      this.localDatabaseService,
      this.logService,
    );
    this.syncService = new PhotosSyncService(
      this.model,
      this.photosSdk,
      this.deviceService,
      this.cameraRollService,
      this.uploadService,
      this.downloadService,
      this.localDatabaseService,
      this.logService,
      this.fileSystemService,
    );
  }

  public get isInitialized(): boolean {
    return this.model.isInitialized;
  }

  public get photosDirectory(): string {
    return this.fileSystemService.photosDirectory;
  }

  public get previewsDirectory(): string {
    return this.fileSystemService.previewsDirectory;
  }

  public async initialize(): Promise<void> {
    await this.fileSystemService.initialize();
    await this.localDatabaseService.initialize();
    await this.userService.initialize();
    await this.deviceService.initialize();

    this.model.isInitialized = true;

    this.logService.info('Initialized');
  }

  /**
   * @description Runs the synchronization process
   * !!! TODO: Delete 'getState' property from 'options' and check limit on server
   * @param options
   * @returns
   */
  public sync(options: {
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
    return this.syncService.run(options);
  }

  public countPhotos(): Promise<number> {
    return this.localDatabaseService.countPhotos();
  }

  public getPhotos({
    limit,
    skip = 0,
  }: {
    limit: number;
    skip?: number;
  }): Promise<{ data: photos.Photo; preview: string }[]> {
    this.checkModel();

    return this.localDatabaseService.getPhotos(skip, limit);
  }

  public getYearsList(): Promise<{ year: number; preview: string }[]> {
    return this.localDatabaseService.getYearsList();
  }

  public getMonthsList(): Promise<{ year: number; month: number; preview: string }[]> {
    return this.localDatabaseService.getMonthsList();
  }

  public getPhotoPreview(photoId: string): Promise<string | null> {
    return this.localDatabaseService.getPhotoPreview(photoId);
  }

  public getAll(): Promise<photos.Photo[]> {
    return this.localDatabaseService.getAll();
  }

  public deletePhoto(photo: photos.Photo): Promise<void> {
    this.checkModel();

    return this.deleteService.delete(photo);
  }

  public getUsage(): Promise<number> {
    return this.usageService.getUsage();
  }

  /**
   * @description Downloads the photo from the network
   * @param fileId
   * @param options
   * @returns The photo path in the file system
   */
  public downloadPhoto(
    fileId: string,
    options: {
      toPath: string;
      downloadProgressCallback: (progress: number) => void;
      decryptionProgressCallback: (progress: number) => void;
    },
  ): Promise<string> {
    this.checkModel();

    return this.downloadService.pullPhoto(this.bucketId, this.model.networkCredentials, fileId, options);
  }

  /**
   * @description Clears all photos data from device
   */
  public async clearData(): Promise<void> {
    await this.fileSystemService.clear();
    await this.localDatabaseService.resetDatabase();
  }

  private get bucketId() {
    return this.model.user?.bucketId || '';
  }

  private checkModel() {
    if (!this.bucketId) {
      throw new Error('(PhotosService) bucketId not found');
    }
  }
}