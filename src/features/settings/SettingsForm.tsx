import { useEffect } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Form, Formik, FormikErrors, FormikHelpers } from 'formik';
import { CURRENCIES, DEFAULT_SETTINGS, SettingsInput } from '../../api/types';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { formatDateTime } from '../../utils/format';
import { SETTINGS_LIMITS, settingsValidationSchema, timezoneOptions } from './settingsSchema';
import {
  fetchSettings,
  SaveSettingsRejection,
  saveSettings,
  saveStatusReset,
  selectSettings,
  selectSettingsError,
  selectSettingsSaveError,
  selectSettingsSaveStatus,
  selectSettingsStatus,
} from './settingsSlice';

const SettingsForm = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettings);
  const status = useAppSelector(selectSettingsStatus);
  const error = useAppSelector(selectSettingsError);
  const saveStatus = useAppSelector(selectSettingsSaveStatus);
  const saveError = useAppSelector(selectSettingsSaveError);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSettings());
    }
  }, [dispatch, status]);

  useEffect(() => () => void dispatch(saveStatusReset()), [dispatch]);

  if (status === 'failed') {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => dispatch(fetchSettings())}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (status === 'idle' || status === 'loading') {
    return (
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Skeleton variant="text" width={180} height={40} />
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={120} />
        </Stack>
      </Paper>
    );
  }

  const initialValues: SettingsInput = settings
    ? {
        siteName: settings.siteName,
        supportEmail: settings.supportEmail,
        currency: settings.currency,
        timezone: settings.timezone,
        maxTicketsPerOrder: settings.maxTicketsPerOrder,
        salesEnabled: settings.salesEnabled,
        bannerMessage: settings.bannerMessage,
      }
    : DEFAULT_SETTINGS;

  const handleSubmit = async (values: SettingsInput, helpers: FormikHelpers<SettingsInput>) => {
    try {
      await dispatch(saveSettings({ ...values, maxTicketsPerOrder: Number(values.maxTicketsPerOrder) })).unwrap();
    } catch (rejection) {
      const fieldErrors = (rejection as SaveSettingsRejection | undefined)?.fieldErrors ?? [];

      if (fieldErrors.length > 0) {
        helpers.setErrors(
          Object.fromEntries(fieldErrors.map((fieldError) => [fieldError.field, fieldError.message])) as FormikErrors<
            SettingsInput
          >,
        );
      }
    }
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={settingsValidationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting, dirty, resetForm }) => (
          <Form noValidate>
            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={3}>
                <Stack spacing={0.5}>
                  <Typography variant="h5" component="h1">
                    Settings
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    These values control how the site behaves for buyers.
                  </Typography>
                  {settings?.updatedAt ? (
                    <Typography variant="caption" color="text.secondary">
                      Last updated {formatDateTime(settings.updatedAt, settings.timezone)}
                    </Typography>
                  ) : null}
                </Stack>

                {saveStatus === 'failed' && saveError && <Alert severity="error">{saveError}</Alert>}

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="siteName"
                      label="Site name"
                      value={values.siteName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.siteName && Boolean(errors.siteName)}
                      helperText={(touched.siteName && errors.siteName) || ' '}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="email"
                      name="supportEmail"
                      label="Support email"
                      value={values.supportEmail}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.supportEmail && Boolean(errors.supportEmail)}
                      helperText={(touched.supportEmail && errors.supportEmail) || ' '}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      select
                      fullWidth
                      name="currency"
                      label="Currency"
                      value={values.currency}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.currency && Boolean(errors.currency)}
                      helperText={(touched.currency && errors.currency) || ' '}
                    >
                      {CURRENCIES.map((currency) => (
                        <MenuItem key={currency} value={currency}>
                          {currency}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      select
                      fullWidth
                      name="timezone"
                      label="Timezone"
                      value={values.timezone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.timezone && Boolean(errors.timezone)}
                      helperText={(touched.timezone && errors.timezone) || ' '}
                    >
                      {timezoneOptions(values.timezone).map((timezone) => (
                        <MenuItem key={timezone} value={timezone}>
                          {timezone}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      name="maxTicketsPerOrder"
                      label="Max tickets per order"
                      value={values.maxTicketsPerOrder}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      inputProps={{
                        min: SETTINGS_LIMITS.ticketsPerOrderMin,
                        max: SETTINGS_LIMITS.ticketsPerOrderMax,
                      }}
                      error={touched.maxTicketsPerOrder && Boolean(errors.maxTicketsPerOrder)}
                      helperText={(touched.maxTicketsPerOrder && errors.maxTicketsPerOrder) || ' '}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      name="bannerMessage"
                      label="Banner message"
                      value={values.bannerMessage}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.bannerMessage && Boolean(errors.bannerMessage)}
                      helperText={
                        (touched.bannerMessage && errors.bannerMessage) ||
                        `${values.bannerMessage.length}/${SETTINGS_LIMITS.bannerMessageMaxLength} characters`
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch name="salesEnabled" checked={values.salesEnabled} onChange={handleChange} />
                      }
                      label="Ticket sales enabled"
                    />
                  </Grid>
                </Grid>

                <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
                  <Button onClick={() => resetForm()} disabled={!dirty || isSubmitting}>
                    Discard changes
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || !dirty}
                    startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
                  >
                    Save settings
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Form>
        )}
      </Formik>

      <Snackbar
        open={saveStatus === 'succeeded'}
        autoHideDuration={4000}
        onClose={() => dispatch(saveStatusReset())}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => dispatch(saveStatusReset())}>
          Settings saved
        </Alert>
      </Snackbar>
    </>
  );
};

export default SettingsForm;
