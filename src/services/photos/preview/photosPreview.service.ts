import { PhotoPreviewType, PhotosItemType } from '@internxt/sdk/dist/photos';
import imageService from '@internxt-mobile/services/ImageService';
import fileSystemService from '@internxt-mobile/services/FileSystemService';
import { PhotoFileSystemRef, PhotosItem, PhotoSizeType } from '@internxt-mobile/types/photos';
import { photosNetwork } from '../network/photosNetwork.service';
import { photosUtils } from '../utils';
import { createThumbnail } from 'react-native-create-thumbnail';

export type GeneratedPreview = {
  type: PhotoPreviewType;
  width: number;
  height: number;
  path: string;
  size: number;
};

export class PhotosPreviewService {
  private static readonly PREVIEW_WIDTH = 512;
  private static readonly PREVIEW_HEIGHT = 512;

  public async generate(photosItem: PhotosItem): Promise<GeneratedPreview> {
    if (photosItem.type === PhotosItemType.VIDEO) {
      return this.generateVideoThumbnail(photosItem);
    }
    const width = PhotosPreviewService.PREVIEW_WIDTH;
    const height = PhotosPreviewService.PREVIEW_HEIGHT;
    const resizerFormat = this.getResizerFormat(photosItem.format);
    if (!photosItem.localUri) throw new Error('Unable to find local uri for photo');
    const result = await imageService.resize({
      uri: photosItem.localUri,
      width,
      height,
      format: resizerFormat,
      quality: 70,
      rotation: 0,
      options: { mode: 'cover' },
    });

    const destination = await photosUtils.cameraRollUriToFileSystemUri({
      name: photosItem.name,
      format: photosItem.format,
      uri: photosItem.localPreviewPath,
      itemType: photosItem.type,
    });

    if (!(await fileSystemService.exists(destination))) {
      await fileSystemService.moveFile(result.path, destination);
    }

    return {
      width: result.width,
      height: result.height,
      size: result.size,
      type: resizerFormat,
      path: destination,
    };
  }

  private getResizerFormat(format: string) {
    const formats: Record<string, PhotoPreviewType> = {
      jpg: 'JPEG',
      png: 'PNG',
    };

    return formats[format] || formats['jpg'];
  }

  /**
   * Gets a local preview for a given photo
   *
   * @param photo The photo to get preview from
   * @returns a FileSystemRef pointing to the image file
   */
  public async getLocalPreview(photo: PhotosItem): Promise<PhotoFileSystemRef | null> {
    try {
      if (!photo.localPreviewPath) throw new Error('Photo does not have a preview');

      const exists = await fileSystemService.exists(photo.localPreviewPath);

      return exists ? photo.localPreviewPath : null;
    } catch (e) {
      return null;
    }
  }

  public async getPreview(photo: PhotosItem): Promise<PhotoFileSystemRef | null> {
    const localPreview = await this.getLocalPreview(photo);

    if (localPreview) {
      return fileSystemService.pathToUri(localPreview);
    }

    if (photo.previewFileId) {
      const photoPreviewRef = await photosNetwork.download(photo.previewFileId, {
        bucketId: photo.bucketId || undefined,
        destination: photo.localPreviewPath,
        decryptionProgressCallback: () => undefined,
        downloadProgressCallback: () => undefined,
      });

      return fileSystemService.pathToUri(photoPreviewRef);
    }

    return null;
  }

  private async generateVideoThumbnail(photosItem: PhotosItem): Promise<GeneratedPreview> {
    if (!photosItem.localUri) throw new Error('Video item does not has a local uri, unable to generate preview');

    const videoPath = await photosUtils.cameraRollUriToFileSystemUri({
      name: photosItem.name,
      format: photosItem.format,
      itemType: photosItem.type,
      uri: photosItem.localUri,
      destination: photosUtils.getPhotoPath({
        name: photosItem.name,
        type: photosItem.format,
        size: PhotoSizeType.Full,
      }),
    });

    const previewPath = photosUtils.getPhotoPath({
      name: photosItem.name,
      type: photosItem.format,
      size: PhotoSizeType.Preview,
    });
    const result = await createThumbnail({
      url: fileSystemService.pathToUri(videoPath),
      dirSize: 100,
    });

    if (!(await fileSystemService.exists(previewPath))) {
      await fileSystemService.copyFile(result.path, previewPath);
    }

    return {
      size: result.size,
      type: 'JPEG',
      width: result.width,
      height: result.height,
      path: previewPath,
    };
  }
}

export const photosPreview = new PhotosPreviewService();
