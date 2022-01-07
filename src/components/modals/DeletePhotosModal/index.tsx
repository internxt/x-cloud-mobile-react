import React from 'react';
import { Text, View } from 'react-native';
import { Photo } from '@internxt/sdk/dist/photos';

import globalStyle from '../../../styles/global.style';
import { tailwind } from '../../../helpers/designSystem';
import BottomModal, { BottomModalProps } from '../BottomModal';
import strings from '../../../../assets/lang/strings';
import BaseButton from '../../BaseButton';
import { useAppDispatch } from '../../../store/hooks';
import { photosThunks } from '../../../store/slices/photos';

function DeletePhotosModal({ isOpen, onClosed, data }: BottomModalProps & { data: Photo[] }): JSX.Element {
  const dispatch = useAppDispatch();
  const onCancelButtonPressed = () => {
    onClosed();
  };
  const onMoveToTrashButtonPressed = async () => {
    await dispatch(photosThunks.deletePhotosThunk({ photos: data }));
    onClosed();
  };

  return (
    <BottomModal isOpen={isOpen} onClosed={onClosed}>
      <Text
        style={[
          tailwind('w-full text-center mt-10 mb-4 text-xl font-semibold text-neutral-500'),
          globalStyle.fontWeight.medium,
        ]}
      >
        {strings.modals.deletePhotosModal.title}
      </Text>
      {/* ADVICE */}
      <Text style={[tailwind('mb-6 px-9 text-center text-sm text-neutral-100'), globalStyle.fontWeight.medium]}>
        {strings.modals.deletePhotosModal.message}
      </Text>

      {/* ACTIONS */}
      <View style={tailwind('p-3 flex-row justify-center')}>
        <BaseButton
          title={strings.components.buttons.cancel}
          type="cancel"
          onPress={onCancelButtonPressed}
          style={tailwind('flex-1')}
        />

        <View style={tailwind('w-2')} />

        <BaseButton
          title={strings.components.buttons.moveToThrash}
          type="delete"
          onPress={onMoveToTrashButtonPressed}
          style={tailwind('flex-1')}
        />
      </View>
    </BottomModal>
  );
}

export default DeletePhotosModal;
