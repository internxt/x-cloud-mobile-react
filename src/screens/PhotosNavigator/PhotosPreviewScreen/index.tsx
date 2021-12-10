import React, { useState } from 'react';
import { View, Text, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { TapGestureHandler } from 'react-native-gesture-handler';
import tailwind, { getColor } from 'tailwind-rn';
import * as Unicons from '@iconscout/react-native-unicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NavigationStackProp } from 'react-navigation-stack';
import { Photo } from '@internxt/sdk';

import PhotosPreviewOptionsModal from '../../../components/modals/PhotosPreviewOptionsModal';
import DeletePhotosModal from '../../../components/modals/DeletePhotosModal';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { layoutActions } from '../../../store/slices/layout';
import strings from '../../../../assets/lang/strings';

interface PreviewProps {
  route: {
    params: {
      data: Photo;
    };
  };
}

function PhotosPreviewScreen(props: PreviewProps): JSX.Element {
  const dispatch = useAppDispatch();
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const { isDeletePhotosModalOpen } = useAppSelector((state) => state.layout);
  const navigation = useNavigation<NavigationStackProp>();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const examplePhoto = require('../../../../assets/images/photos/example.png');
  const onBackButtonPressed = () => navigation.goBack();
  const onShareButtonPressed = () => {
    console.log('onShareButtonPressed!');
  };
  const onDownloadButtonPressed = () => {
    console.log('onDownloadButtonPressed!');
  };
  const onMoveToTrashButtonPressed = () => {
    dispatch(layoutActions.setIsDeletePhotosModalOpen(true));
  };

  return (
    <>
      {/* MODALS */}
      <PhotosPreviewOptionsModal
        isOpen={isOptionsModalOpen}
        onClosed={() => setIsOptionsModalOpen(false)}
        data={props.route.params.data}
      />
      <DeletePhotosModal
        isOpen={isDeletePhotosModalOpen}
        onClosed={() => dispatch(layoutActions.setIsDeletePhotosModalOpen(false))}
        data={[props.route.params.data]}
      />

      <View style={tailwind('h-full')}>
        {/* PHOTO */}
        <TapGestureHandler numberOfTaps={1} enabled={true}>
          <Image resizeMode={'contain'} style={tailwind('bg-black w-full h-full absolute')} source={examplePhoto} />
        </TapGestureHandler>

        <SafeAreaView style={tailwind('flex-col justify-between h-full')}>
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.24)', 'transparent']}
            style={tailwind('absolute w-full')}
          >
            <View style={tailwind('flex-row justify-between p-5')}>
              {/* BACK BUTTON */}
              <TouchableOpacity style={tailwind('z-10')} onPress={onBackButtonPressed}>
                <Unicons.UilAngleLeft color={getColor('white')} size={32} />
              </TouchableOpacity>

              {/* OPTIONS BUTTON */}
              <TouchableOpacity style={tailwind('z-10')} onPress={() => setIsOptionsModalOpen(true)}>
                <Unicons.UilEllipsisH color={getColor('white')} size={32} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.24)', 'rgba(0,0,0,0.6)']}
            style={tailwind('flex-row justify-around p-3 absolute bottom-0 w-full')}
          >
            <TouchableOpacity style={tailwind('items-center')} onPress={onShareButtonPressed}>
              <Unicons.UilLink color="white" size={26} />
              <Text style={tailwind('text-white text-xs')}>{strings.components.buttons.shareWithLink}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tailwind('items-center')} onPress={onDownloadButtonPressed}>
              <Unicons.UilImport color="white" size={26} />
              <Text style={tailwind('text-white text-xs')}>{strings.components.buttons.download}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tailwind('items-center')} onPress={onMoveToTrashButtonPressed}>
              <Unicons.UilTrashAlt color="white" size={26} />
              <Text style={tailwind('text-white text-xs')}>{strings.components.buttons.moveToThrash}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </SafeAreaView>
      </View>
    </>
  );
}

export default PhotosPreviewScreen;
