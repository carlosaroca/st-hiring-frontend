import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiError, ApiFieldError } from '../../api/client';
import { fetchSettingsRequest, saveSettingsRequest } from '../../api/settings.api';
import { Settings, SettingsInput } from '../../api/types';
import type { RootState } from '../../app/store';
import type { RequestStatus } from '../../app/types';

export interface SaveSettingsRejection {
  message: string;
  fieldErrors: ApiFieldError[];
}

interface SettingsState {
  data: Settings | null;
  status: RequestStatus;
  error: string | null;
  saveStatus: RequestStatus;
  saveError: string | null;
}

const initialState: SettingsState = {
  data: null,
  status: 'idle',
  error: null,
  saveStatus: 'idle',
  saveError: null,
};

export const fetchSettings = createAsyncThunk('settings/fetchSettings', () => fetchSettingsRequest());

export const saveSettings = createAsyncThunk<Settings, SettingsInput, { rejectValue: SaveSettingsRejection }>(
  'settings/saveSettings',
  async (input, { rejectWithValue }) => {
    try {
      return await saveSettingsRequest(input);
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue({ message: error.message, fieldErrors: error.fieldErrors });
      }

      throw error;
    }
  },
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    saveStatusReset: (state) => {
      state.saveStatus = 'idle';
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to load the settings';
      })
      .addCase(saveSettings.pending, (state) => {
        state.saveStatus = 'loading';
        state.saveError = null;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.data = action.payload;
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.saveError = action.payload?.message ?? action.error.message ?? 'Unable to save the settings';
      });
  },
});

export const { saveStatusReset } = settingsSlice.actions;

export const selectSettings = (state: RootState) => state.settings.data;

export const selectSettingsStatus = (state: RootState) => state.settings.status;

export const selectSettingsError = (state: RootState) => state.settings.error;

export const selectSettingsSaveStatus = (state: RootState) => state.settings.saveStatus;

export const selectSettingsSaveError = (state: RootState) => state.settings.saveError;

export default settingsSlice.reducer;
