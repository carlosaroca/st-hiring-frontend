import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Fab,
  Grid,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DEFAULT_SETTINGS, EventSummary } from '../../api/types';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import TuneIcon from '../../components/TuneIcon';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useIntersection } from '../../hooks/useIntersection';
import { selectSettings } from '../settings/settingsSlice';
import { eventOpened, selectTicketsEvent } from '../tickets/ticketsSlice';
import EventCard from './EventCard';
import {
  fetchEvents,
  loadEventsPage,
  modeChanged,
  searchChanged,
  selectEvents,
  selectEventsError,
  selectEventsMode,
  selectEventsMoreError,
  selectEventsMoreStatus,
  selectEventsNextCursor,
  selectEventsSearch,
  selectEventsStatus,
} from './eventsSlice';

const EventTicketsDialog = lazy(() => import('../tickets/EventTicketsDialog'));

const SKELETON_COUNT = 6;
const MORE_SKELETON_COUNT = 3;
const SEARCH_DEBOUNCE_MS = 300;

const EventCardSkeleton = () => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Skeleton variant="text" width="75%" height={30} />
      <Stack spacing={0.5}>
        <Skeleton variant="text" width="55%" />
        <Skeleton variant="text" width="40%" />
      </Stack>
      <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
      <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
        <Skeleton variant="rounded" width={110} height={24} />
        <Skeleton variant="rounded" width={80} height={24} />
      </Stack>
    </CardContent>
  </Card>
);

const EventsSkeletonGrid = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
        <EventCardSkeleton />
      </Grid>
    ))}
  </>
);

const EventsList = () => {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectEvents);
  const status = useAppSelector(selectEventsStatus);
  const error = useAppSelector(selectEventsError);
  const mode = useAppSelector(selectEventsMode);
  const search = useAppSelector(selectEventsSearch);
  const nextCursor = useAppSelector(selectEventsNextCursor);
  const moreStatus = useAppSelector(selectEventsMoreStatus);
  const moreError = useAppSelector(selectEventsMoreError);
  const settings = useAppSelector(selectSettings);
  const selectedEvent = useAppSelector(selectTicketsEvent);

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS);

  const isAdvanced = mode === 'paginated';

  useEffect(() => {
    dispatch(searchChanged(debouncedSearch));
  }, [dispatch, debouncedSearch]);

  useEffect(() => {
    if (!isAdvanced && status === 'idle') {
      dispatch(fetchEvents());
    }
  }, [dispatch, isAdvanced, status]);

  useEffect(() => {
    if (isAdvanced) {
      dispatch(loadEventsPage({ search, cursor: null }));
    }
  }, [dispatch, isAdvanced, search]);

  const handleLoadMore = useCallback(() => {
    if (nextCursor !== null && moreStatus !== 'loading') {
      dispatch(loadEventsPage({ search, cursor: nextCursor }));
    }
  }, [dispatch, nextCursor, moreStatus, search]);

  const sentinelRef = useIntersection<HTMLDivElement>(
    handleLoadMore,
    isAdvanced && status === 'succeeded' && nextCursor !== null && moreStatus !== 'failed',
  );

  const visibleEvents = useMemo(() => {
    if (isAdvanced || search === '') {
      return events;
    }

    const term = search.toLowerCase();

    return events.filter(
      (event) => event.name.toLowerCase().includes(term) || event.location.toLowerCase().includes(term),
    );
  }, [events, isAdvanced, search]);

  const currency = settings?.currency ?? DEFAULT_SETTINGS.currency;
  const timezone = settings?.timezone ?? DEFAULT_SETTINGS.timezone;

  const retry = () => {
    if (isAdvanced) {
      dispatch(loadEventsPage({ search, cursor: null }));
      return;
    }

    dispatch(fetchEvents());
  };

  const handleSelect = (event: EventSummary) => dispatch(eventOpened(event));

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="h5" component="h1">
            Upcoming events
          </Typography>
          <Chip
            size="small"
            label={isAdvanced ? 'Advanced' : 'Simple'}
            color={isAdvanced ? 'primary' : 'default'}
            variant={isAdvanced ? 'filled' : 'outlined'}
          />
        </Stack>
        <TextField
          size="small"
          label="Search by name or location"
          value={searchInput}
          onChange={(changeEvent) => setSearchInput(changeEvent.target.value)}
          sx={{ width: { xs: '100%', sm: 340 } }}
        />
      </Stack>

      {status === 'failed' ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={retry}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      ) : null}

      {status === 'idle' || status === 'loading' ? (
        <Grid container spacing={2}>
          <EventsSkeletonGrid count={SKELETON_COUNT} />
        </Grid>
      ) : null}

      {status === 'succeeded' ? (
        <>
          {visibleEvents.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {search === '' ? 'There are no events to show yet.' : 'No events match your search.'}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {visibleEvents.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <EventCard event={event} currency={currency} timezone={timezone} onSelect={handleSelect} />
                </Grid>
              ))}
              {isAdvanced && moreStatus === 'loading' ? <EventsSkeletonGrid count={MORE_SKELETON_COUNT} /> : null}
            </Grid>
          )}

          {isAdvanced && moreStatus === 'failed' ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={handleLoadMore}>
                  Retry
                </Button>
              }
            >
              {moreError}
            </Alert>
          ) : null}

          {isAdvanced && nextCursor !== null ? <Box ref={sentinelRef} sx={{ height: 1 }} /> : null}

          {isAdvanced && nextCursor === null && visibleEvents.length > 0 ? (
            <Typography variant="caption" color="text.secondary" textAlign="center">
              You have reached the end of the list.
            </Typography>
          ) : null}
        </>
      ) : null}

      <Tooltip title="Advanced mode" placement="left">
        <Fab
          color={isAdvanced ? 'primary' : 'default'}
          aria-label="Advanced mode"
          aria-pressed={isAdvanced}
          onClick={() => dispatch(modeChanged(isAdvanced ? 'all' : 'paginated'))}
          sx={{ position: 'fixed', bottom: { xs: 16, sm: 24 }, right: { xs: 16, sm: 24 } }}
        >
          <TuneIcon />
        </Fab>
      </Tooltip>

      {selectedEvent !== null ? (
        <Suspense fallback={null}>
          <EventTicketsDialog />
        </Suspense>
      ) : null}
    </Stack>
  );
};

export default EventsList;
