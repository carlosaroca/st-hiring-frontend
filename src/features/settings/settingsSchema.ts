import * as Yup from 'yup';
import { CURRENCIES } from '../../api/types';

export const SETTINGS_LIMITS = {
  siteNameMaxLength: 100,
  bannerMessageMaxLength: 280,
  ticketsPerOrderMin: 1,
  ticketsPerOrderMax: 50,
};

const COMMON_TIMEZONES = [
  'UTC',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Berlin',
  'Europe/Amsterdam',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/Bogota',
  'America/Argentina/Buenos_Aires',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export const timezoneOptions = (current: string): string[] =>
  COMMON_TIMEZONES.includes(current) ? COMMON_TIMEZONES : [current, ...COMMON_TIMEZONES];

export const settingsValidationSchema = Yup.object({
  siteName: Yup.string()
    .trim()
    .required('Site name is required')
    .max(SETTINGS_LIMITS.siteNameMaxLength, `Site name must be at most ${SETTINGS_LIMITS.siteNameMaxLength} characters`),
  supportEmail: Yup.string()
    .trim()
    .required('Support email is required')
    .email('Support email must be a valid email address'),
  currency: Yup.string().required('Currency is required').oneOf(CURRENCIES, 'Choose one of the supported currencies'),
  timezone: Yup.string().trim().required('Timezone is required'),
  maxTicketsPerOrder: Yup.number()
    .typeError('Max tickets per order must be a number')
    .required('Max tickets per order is required')
    .integer('Max tickets per order must be a whole number')
    .min(SETTINGS_LIMITS.ticketsPerOrderMin, `Must be at least ${SETTINGS_LIMITS.ticketsPerOrderMin}`)
    .max(SETTINGS_LIMITS.ticketsPerOrderMax, `Must be at most ${SETTINGS_LIMITS.ticketsPerOrderMax}`),
  salesEnabled: Yup.boolean().required(),
  bannerMessage: Yup.string()
    .trim()
    .max(
      SETTINGS_LIMITS.bannerMessageMaxLength,
      `Banner message must be at most ${SETTINGS_LIMITS.bannerMessageMaxLength} characters`,
    ),
});
