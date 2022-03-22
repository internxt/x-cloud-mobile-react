import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../..';
import strings from '../../../../assets/lang/strings';
import newsletterService from '../../../services/newsletter';
import toastService from '../../../services/toast';
import { ToastType } from '../../../types';
import { referralsThunks } from '../referrals';
import { storageThunks } from '../storage';

export interface NewsletterState {
  isSubscribing: boolean;
}

const initialState: NewsletterState = {
  isSubscribing: false,
};

const subscribeThunk = createAsyncThunk<void, string, { state: RootState }>(
  'newsletter/subscribe',
  async (email, { dispatch }) => {
    await newsletterService.subscribe(email);
    dispatch(referralsThunks.fetchReferralsThunk());
    dispatch(storageThunks.getUsageAndLimitThunk());
  },
);

export const newsletterSlice = createSlice({
  name: 'newsletter',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(subscribeThunk.pending, (state) => {
        state.isSubscribing = true;
      })
      .addCase(subscribeThunk.fulfilled, (state) => {
        state.isSubscribing = false;
      })
      .addCase(subscribeThunk.rejected, (state, action) => {
        state.isSubscribing = false;

        toastService.show({
          type: ToastType.Error,
          text1: strings.formatString(
            strings.errors.subscribeToNewsletter,
            action.error.message || strings.errors.unknown,
          ) as string,
        });
      });
  },
});

export const newsletterActions = newsletterSlice.actions;

export const newsletterThunks = {
  subscribeThunk,
};

export default newsletterSlice.reducer;
