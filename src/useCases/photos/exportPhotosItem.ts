import errorService from '@internxt-mobile/services/ErrorService';
import fileSystemService from '@internxt-mobile/services/FileSystemService';
import notificationsService from '@internxt-mobile/services/NotificationsService';
import photos from '@internxt-mobile/services/photos';
import { PhotosAnalyticsEventKey } from '@internxt-mobile/services/photos/analytics';
import { photosUtils } from '@internxt-mobile/services/photos/utils';

import { PhotosItem } from '@internxt-mobile/types/photos';
import strings from 'assets/lang/strings';

export const exportPhotosItem = async ({ photosItemToShare }: { photosItemToShare: PhotosItem }) => {
  try {
    photos.analytics.track(PhotosAnalyticsEventKey.ExportPhotoSelected);
    const fileUri = await photosUtils.cameraRollUriToFileSystemUri(
      {
        name: photosItemToShare.name,
        type: photosItemToShare.format,
      },
      photosItemToShare.localFullSizePath,
    );
    const result = await fileSystemService.shareFile({
      title: photosItemToShare.getDisplayName(),
      fileUri,
    });

    if (result.success) {
      photos.analytics.track(PhotosAnalyticsEventKey.PhotoExported);
    }
    await fileSystemService.unlinkIfExists(fileUri);
  } catch (error) {
    errorService.reportError(error);
    notificationsService.error(strings.errors.generic.title);
  }
};
