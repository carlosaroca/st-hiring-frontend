import { request } from './client';
import { Settings, SettingsInput } from './types';

export const fetchSettingsRequest = (): Promise<Settings> => request<Settings>('/settings');

export const saveSettingsRequest = (input: SettingsInput): Promise<Settings> =>
  request<Settings>('/settings', { method: 'POST', body: JSON.stringify(input) });
