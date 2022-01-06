import React, { useEffect } from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Alert,
  TextInput,
  TouchableHighlight,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Unicons from '@iconscout/react-native-unicons';

import strings from '../../../assets/lang/strings';
import analytics from '../../services/analytics';
import InternxtLogo from '../../../assets/logo.svg';
import { getColor, tailwind } from '../../helpers/designSystem';
import VersionUpdate from '../../components/VersionUpdate';
import authService from '../../services/auth';
import validationService from '../../services/validation';
import { AppScreen } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { authThunks } from '../../store/slices/auth';
import { useNavigation } from '@react-navigation/native';
import { NavigationStackProp } from 'react-navigation-stack';
import errorService from '../../services/error';

function SignInScreen(): JSX.Element {
  const navigation = useNavigation<NavigationStackProp>();
  const dispatch = useAppDispatch();
  const { error: authError } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const handleOnPress = async () => {
    setIsLoading(true);

    try {
      const userLoginData = await authService.apiLogin(email);

      if (userLoginData.tfa && !twoFactorCode) {
        setShowTwoFactor(true);
        setIsLoading(false);
      } else {
        await dispatch(authThunks.signInThunk({ email, password, sKey: userLoginData.sKey, twoFactorCode }));
        navigation.replace(AppScreen.TabExplorer);
      }
    } catch (err) {
      const castedError = errorService.castError(err);

      analytics
        .track('user-signin-attempted', {
          status: 'error',
          message: castedError.message,
        })
        .catch(() => undefined);

      Alert.alert('Could not log in', castedError.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authError) {
      Alert.alert('Login error', authError);
      setIsLoading(false);
    }
  }, [authError]);

  return (
    <KeyboardAvoidingView behavior="height" style={tailwind('app-screen p-5 bg-white h-full justify-between')}>
      <View></View>
      <View style={isLoading ? tailwind('opacity-50') : tailwind('opacity-100')}>
        <View>
          <View style={tailwind('items-center pb-10')}>
            <InternxtLogo />
          </View>
        </View>

        <View style={showTwoFactor ? tailwind('hidden') : tailwind('flex')}>
          <View style={tailwind('input-wrapper my-2 items-stretch')}>
            <TextInput
              style={tailwind('input pl-4')}
              value={email}
              onChangeText={(value) => setEmail(value)}
              placeholder={strings.components.inputs.email}
              placeholderTextColor="#666"
              maxLength={64}
              keyboardType="email-address"
              autoCapitalize={'none'}
              autoCorrect={false}
              autoCompleteType="username"
              textContentType="emailAddress"
              editable={!isLoading}
            />
          </View>

          <View style={tailwind('input-wrapper my-2 items-stretch')}>
            <TextInput
              style={tailwind('input pl-4')}
              value={password}
              onChangeText={(value) => setPassword(value)}
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              placeholder={strings.components.inputs.password}
              placeholderTextColor="#666"
              secureTextEntry={!showPasswordText}
              autoCompleteType="password"
              autoCapitalize="none"
              textContentType="password"
              editable={!isLoading}
            />

            {(!!password || passwordFocus) && (
              <TouchableWithoutFeedback onPress={() => setShowPasswordText(!showPasswordText)}>
                <View style={tailwind('justify-center p-3')}>
                  {showPasswordText ? (
                    <Unicons.UilEyeSlash color={getColor('neutral-80')} />
                  ) : (
                    <Unicons.UilEye color={getColor('neutral-80')} />
                  )}
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>
        </View>

        <View style={showTwoFactor ? tailwind('') : tailwind('hidden')}>
          <View
            style={[
              tailwind('input-wrapper my-2 items-stretch'),
              validationService.validate2FA(twoFactorCode) ? {} : tailwind('border-red-50'),
            ]}
          >
            <TextInput
              style={tailwind('input pl-4')}
              value={twoFactorCode}
              onChangeText={(value) => setTwoFactorCode(value)}
              placeholder="Two-factor code"
              placeholderTextColor="#666"
              maxLength={64}
              keyboardType="numeric"
              textContentType="none"
            />
          </View>
        </View>

        <View>
          <TouchableHighlight style={tailwind('btn btn-primary my-5')} underlayColor="#4585f5" onPress={handleOnPress}>
            <Text style={tailwind('text-base btn-label')}>
              {isLoading ? strings.components.buttons.descrypting : strings.components.buttons.sign_in}
            </Text>
          </TouchableHighlight>

          <Text
            style={tailwind('text-center text-sm m-2 text-blue-60')}
            onPress={() => navigation.replace(AppScreen.ForgotPassword)}
          >
            {strings.screens.login_screen.forgot}
          </Text>

          <Text style={tailwind('text-center mt-2')} onPress={() => navigation.replace(AppScreen.SignUp)}>
            <Text style={tailwind('text-sm')}>{strings.screens.login_screen.no_register} </Text>
            <Text style={tailwind('text-sm text-blue-60')}>{strings.screens.login_screen.register}</Text>
          </Text>
        </View>
      </View>

      <VersionUpdate />
    </KeyboardAvoidingView>
  );
}

export default SignInScreen;