import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Dimensions, Easing, Keyboard, Platform, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import Modal from 'react-native-modalbox';
import { useKeyboard } from 'src/hooks/useKeyboard';
import { useTailwind } from 'tailwind-rn';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
export interface CenterModalProps {
  isOpen: boolean;
  backdropPressToClose?: boolean;
  backButtonClose?: boolean;
  onClosed: () => void;
  onOpened?: () => void;
  children?: JSX.Element;
  style?: ViewStyle;
}

const defaultProps: Partial<CenterModalProps> = {
  backdropPressToClose: true,
  backButtonClose: true,
};

const CenterModal = ({
  isOpen,
  onClosed,
  onOpened,
  children,
  backdropPressToClose = defaultProps.backdropPressToClose,
  backButtonClose = defaultProps.backButtonClose,
  style,
}: CenterModalProps): JSX.Element => {
  const { keyboardShown, coordinates } = useKeyboard();
  const top = useSharedValue<number>(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      top: withTiming(top.value, { duration: 250 }),
    };
  }, [keyboardShown]);

  const getModalTop = () => {
    if (!keyboardShown || Platform.OS === 'android') return 0;

    const screenHeight = Dimensions.get('window').height;
    return -(screenHeight - coordinates.end.height) / 4;
  };
  useEffect(() => {
    top.value = getModalTop();
  }, [keyboardShown]);

  const tailwind = useTailwind();
  const onBackdropPressed = () => {
    backdropPressToClose && onClosed();
  };

  const handleOnClose = () => {
    // Dismiss the keyboard in case the modal has
    // a focused form inside
    Keyboard.dismiss();
    onClosed();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClosed={handleOnClose}
      onOpened={onOpened}
      position={'top'}
      style={[tailwind('bg-transparent')]}
      backButtonClose={backButtonClose}
      backdropPressToClose={false}
      animationDuration={250}
      easing={Easing.ease}
    >
      <Animated.View style={[tailwind('h-full'), animatedStyle]}>
        <StatusBar translucent />

        <TouchableWithoutFeedback onPress={onBackdropPressed}>
          <View style={[tailwind('px-5 flex-grow justify-center items-center')]}>
            <TouchableWithoutFeedback>
              <View style={[tailwind('w-full bg-white rounded-xl'), style]}>{children}</View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </Modal>
  );
};

export default CenterModal;
