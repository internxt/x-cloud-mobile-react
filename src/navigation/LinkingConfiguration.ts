/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['inxt'],
  config: {
    screens: {
      Debug: 'debug',
      SignIn: 'sign-in',
      SignUp: 'sign-up',
      TabExplorer: 'tab-explorer',
      ForgotPassword: 'forgot-password',
      Storage: 'storage',
      Billing: 'billing',
      ChangePassword: 'change-password',
      RecoverPassword: 'recover-password',
      PhotosPreview: 'photos-preview',
    },
  },
};

export default linking;
