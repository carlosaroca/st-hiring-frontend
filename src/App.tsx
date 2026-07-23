import { useEffect, useState } from 'react';
import { Alert, AppBar, Box, Container, Stack, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import { DEFAULT_SETTINGS } from './api/types';
import { useAppDispatch, useAppSelector } from './app/hooks';
import EventsList from './features/events/EventsList';
import SettingsForm from './features/settings/SettingsForm';
import { fetchSettings, selectSettings, selectSettingsStatus } from './features/settings/settingsSlice';

const App = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettings);
  const status = useAppSelector(selectSettingsStatus);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSettings());
    }
  }, [dispatch, status]);

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default' }}>
      <AppBar position="sticky">
        <Toolbar
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            rowGap: 0,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" component="div" noWrap>
            {settings?.siteName ?? DEFAULT_SETTINGS.siteName}
          </Typography>

          <Tabs
            value={tab}
            onChange={(_event, value: number) => setTab(value)}
            textColor="inherit"
            indicatorColor="secondary"
          >
            <Tab label="Events" id="events-tab" aria-controls="events-panel" />
            <Tab label="Settings" id="settings-tab" aria-controls="settings-panel" />
          </Tabs>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
        <Stack spacing={2}>
          {settings?.bannerMessage ? <Alert severity="info">{settings.bannerMessage}</Alert> : null}
          {settings && !settings.salesEnabled ? (
            <Alert severity="warning">Ticket sales are currently disabled.</Alert>
          ) : null}

          <Box role="tabpanel" id="events-panel" aria-labelledby="events-tab" hidden={tab !== 0}>
            {tab === 0 ? <EventsList /> : null}
          </Box>

          <Box role="tabpanel" id="settings-panel" aria-labelledby="settings-tab" hidden={tab !== 1}>
            {tab === 1 ? <SettingsForm /> : null}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default App;
