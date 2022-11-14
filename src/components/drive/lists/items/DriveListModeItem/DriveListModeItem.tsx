import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, TouchableHighlight, Animated, Easing } from 'react-native';

import { FolderIcon, getFileTypeIcon } from '../../../../../helpers';
import prettysize from 'prettysize';
import { useAppSelector } from '../../../../../store/hooks';
import { ArrowCircleUp, DotsThree, Link } from 'phosphor-react-native';
import strings from '../../../../../../assets/lang/strings';
import ProgressBar from '../../../../AppProgressBar';
import { items } from '@internxt/lib';
import AppText from '../../../../AppText';

import { DriveItemProps, DriveListType } from '../../../../../types/drive';
import useDriveItem from '../../../../../hooks/useDriveItem';
import { useTailwind } from 'tailwind-rn';
import useGetColor from '../../../../../hooks/useColor';
import { time } from '@internxt-mobile/services/common/time';
import { driveActions, driveSelectors } from 'src/store/slices/drive';

export function DriveListModeItem(props: DriveItemProps): JSX.Element {
  const tailwind = useTailwind();
  const getColor = useGetColor();
  const { selectedItems } = useAppSelector((state) => state.drive);
  const isSelectionMode = selectedItems.length > 0;
  const spinValue = new Animated.Value(1);
  const iconSize = 40;
  const IconFile = getFileTypeIcon(props.data.type || '');
  const { isFolder, isIdle, isUploading, isDownloading, onItemPressed, onItemLongPressed, onActionsButtonPressed } =
    useDriveItem({ ...props, isSharedLinkItem: props.type === DriveListType.Shared });

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 0,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const getUpdatedAt = () => {
    return time.getFormattedDate(props.data.createdAt, time.formats.dateAtTime);
  };
  return (
    <TouchableHighlight
      disabled={isUploading || isDownloading}
      underlayColor={getColor('text-neutral-20')}
      onLongPress={props.onActionsPress || onItemLongPressed}
      onPress={props.onPress || onItemPressed}
    >
      <View style={[tailwind('flex-row pl-5')]}>
        <View style={[tailwind('flex-row flex-1 py-3')]}>
          <View style={[tailwind('mb-1 mr-4 items-center justify-center'), isUploading && tailwind('opacity-40')]}>
            {isFolder ? (
              <FolderIcon width={iconSize} height={iconSize} />
            ) : (
              <IconFile width={iconSize} height={iconSize} />
            )}
            {props.type === DriveListType.Shared && (
              <View
                style={[
                  tailwind('absolute -bottom-1 -right-2 flex bg-white items-center justify-center rounded-full'),
                  { width: 20, height: 20 },
                ]}
              >
                <View
                  style={[
                    tailwind('bg-primary rounded-full flex items-center justify-center'),
                    { width: 16, height: 16 },
                  ]}
                >
                  <Link weight="bold" size={10} color={getColor('text-white')} />
                </View>
              </View>
            )}
          </View>

          <View style={[tailwind('flex-1 flex items-start justify-center')]}>
            <AppText
              style={[tailwind('text-left text-base text-neutral-500'), isUploading && tailwind('opacity-40')]}
              numberOfLines={1}
              ellipsizeMode={'middle'}
              medium
            >
              {items.getItemDisplayName(props.data)}
            </AppText>

            {isUploading &&
              (props.progress === 0 ? (
                <Text style={tailwind('text-xs text-blue-60')}>{strings.screens.drive.encrypting}</Text>
              ) : (
                <View style={tailwind('flex-row items-center')}>
                  <ArrowCircleUp weight="fill" color={getColor('text-blue-60')} size={16} />
                  <AppText style={tailwind('ml-1.5 text-xs text-blue-60')}>
                    {((props.progress || 0) * 100).toFixed(0) + '%'}
                  </AppText>
                  <ProgressBar
                    style={tailwind('flex-grow h-1 ml-1.5')}
                    progressStyle={tailwind('h-1')}
                    totalValue={1}
                    currentValue={props.progress || 0}
                  />
                </View>
              ))}

            {isIdle &&
              props.type !== DriveListType.Shared &&
              (props.subtitle ? (
                props.subtitle
              ) : (
                <View style={tailwind('flex flex-row items-center')}>
                  {!isFolder && (
                    <AppText style={tailwind('text-xs text-gray-60')}>{prettysize(props.data.size || 0)}</AppText>
                  )}
                  {!isFolder && <View style={[tailwind('bg-gray-60 rounded-full mx-1.5'), { width: 3, height: 3 }]} />}
                  <AppText style={tailwind('text-xs text-gray-60')}>{getUpdatedAt()}</AppText>
                </View>
              ))}
          </View>
        </View>

        <TouchableOpacity
          disabled={isUploading || isDownloading}
          style={isSelectionMode && tailwind('hidden')}
          onPress={props.onActionsPress || onActionsButtonPressed}
          onLongPress={props.onActionsPress || onActionsButtonPressed}
        >
          <View style={[isUploading && tailwind('opacity-40'), tailwind('px-5 flex-1 items-center justify-center')]}>
            <DotsThree weight="bold" size={22} color={getColor('text-neutral-60')} />
          </View>
        </TouchableOpacity>
      </View>
    </TouchableHighlight>
  );
}
