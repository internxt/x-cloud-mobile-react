import React, { useState } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { StyleSheet, Image, ActivityIndicator, View, Platform } from 'react-native';
import FileViewer from 'react-native-file-viewer';
import PhotoBadge from './PhotoBadge';
import { cachePicture, downloadPhoto, IHashedPhoto } from '../../screens/Photos/init';
import { LinearGradient } from 'expo-linear-gradient';
import SimpleToast from 'react-native-simple-toast';
import RNFS from 'react-native-fs'
import { DEVICE_WIDTH } from '../../../App';
import { tailwind } from '../../tailwind'

interface PhotoProps {
  badge?: JSX.Element
  item: IHashedPhoto
  pushDownloadedPhoto?: (downloadedPhoto: IHashedPhoto) => void
}

export default function Photo(props: PhotoProps): JSX.Element {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false)
  const [progress, setProgress] = useState(0)

  const [item, setItem] = useState(props.item)

  const handleOnPress = () => {
    if (!item.localUri) {
      return;
    }

    if (item.isUploaded && !item.isLocal && !isDownloading) {
      setIsDownloading(true)
      downloadPhoto(item, setProgress).then(photo => {
        setItem(photo)
        if (props.pushDownloadedPhoto) {
          props.pushDownloadedPhoto(photo)
        }

        SimpleToast.show('Image downloaded!', 0.15)
      }).catch(() => {
        SimpleToast.show('Could not download image', 0.15)
      }).finally(() => setIsDownloading(false))
    } else {
      cachePicture(item).then(res => {
        FileViewer.open(res, {
          onDismiss: () => RNFS.unlink(res)
        })
      }).catch(() => SimpleToast.show('Could not open the image', 0.15))
    }
  }

  try {
    const urlEncoded = item.localUri.startsWith('file://')

    if (Platform.OS === 'android' && props.item.isUploaded && !urlEncoded) {
      props.item.localUri = 'file://' + props.item.localUri;
    }
  } catch { }

  return (
    <TouchableOpacity
      onPress={() => handleOnPress()}
      disabled={isDownloading}
    >
      <View style={{ width: (DEVICE_WIDTH - 40) / 3, height: (DEVICE_WIDTH - 80) / 3 }}>
        <View style={tailwind('m-0.5')}>
          <Image
            onLoadEnd={() => setIsLoaded(true)}
            style={tailwind('self-center rounded-md w-full h-full')}
            resizeMode='cover'
            source={{ uri: item.localUri }}
          />
        </View>

        {!isLoaded || isDownloading ?
          <ActivityIndicator color='gray' size='small' style={tailwind('absolute')} />
          :
          props.badge ||
          <PhotoBadge
            isUploaded={item.isUploaded}
            isLocal={item.isLocal}
            isDownloading={item.isDownloading}
            isUploading={item.isUploading}
          />
        }

        <View style={tailwind('absolute bottom-0 self-center w-11/12 mb-4 pl-1')}>
          {
            true ?
              <LinearGradient
                colors={['#47c7fd', '#096dff']}
                start={[0, 0.7]}
                end={[0.7, 1]}
                style={[styles.progressIndicator, { width: (DEVICE_WIDTH / 3.5 - 40) * progress }]} />
              :
              null
          }
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  progressIndicator: {
    backgroundColor: '#87B7FF',
    borderRadius: 3,
    height: 6
  }
});