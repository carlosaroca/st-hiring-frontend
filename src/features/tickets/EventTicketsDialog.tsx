import { useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { DEFAULT_SETTINGS, TICKET_STATUSES } from '../../api/types';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useIntersection } from '../../hooks/useIntersection';
import { formatDateTime, formatPrice, formatPriceRange } from '../../utils/format';
import { selectSettings } from '../settings/settingsSlice';
import {
  dialogClosed,
  loadTicketsPage,
  selectTickets,
  selectTicketsError,
  selectTicketsEvent,
  selectTicketsMoreError,
  selectTicketsMoreStatus,
  selectTicketsNextCursor,
  selectTicketsStatus,
  selectTicketsStatusFilter,
  statusFilterChanged,
  TicketStatusFilter,
} from './ticketsSlice';

const FILTERS: TicketStatusFilter[] = ['all', ...TICKET_STATUSES];

const FILTER_LABELS: Record<TicketStatusFilter, string> = {
  all: 'All',
  available: 'Available',
  sold: 'Sold',
  reserved: 'Reserved',
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'default'> = {
  available: 'success',
  reserved: 'warning',
  sold: 'default',
};

const SKELETON_COUNT = 6;
const MORE_SKELETON_COUNT = 3;

const TicketRowsSkeleton = ({ count }: { count: number }) => (
  <Stack spacing={1}>
    {Array.from({ length: count }, (_, index) => (
      <Skeleton key={index} variant="rectangular" height={44} sx={{ borderRadius: 1 }} />
    ))}
  </Stack>
);

const EventTicketsDialog = () => {
  const dispatch = useAppDispatch();
  const event = useAppSelector(selectTicketsEvent);
  const tickets = useAppSelector(selectTickets);
  const status = useAppSelector(selectTicketsStatus);
  const error = useAppSelector(selectTicketsError);
  const statusFilter = useAppSelector(selectTicketsStatusFilter);
  const nextCursor = useAppSelector(selectTicketsNextCursor);
  const moreStatus = useAppSelector(selectTicketsMoreStatus);
  const moreError = useAppSelector(selectTicketsMoreError);
  const settings = useAppSelector(selectSettings);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const eventId = event?.id ?? null;

  useEffect(() => {
    if (eventId !== null) {
      dispatch(loadTicketsPage({ eventId, status: statusFilter, cursor: null }));
    }
  }, [dispatch, eventId, statusFilter]);

  const handleLoadMore = useCallback(() => {
    if (eventId !== null && nextCursor !== null && moreStatus !== 'loading') {
      dispatch(loadTicketsPage({ eventId, status: statusFilter, cursor: nextCursor }));
    }
  }, [dispatch, eventId, nextCursor, moreStatus, statusFilter]);

  const sentinelRef = useIntersection<HTMLDivElement>(
    handleLoadMore,
    status === 'succeeded' && nextCursor !== null && moreStatus !== 'failed',
    contentRef,
  );

  if (event === null) {
    return null;
  }

  const currency = settings?.currency ?? DEFAULT_SETTINGS.currency;
  const timezone = settings?.timezone ?? DEFAULT_SETTINGS.timezone;

  return (
    <Dialog open onClose={() => dispatch(dialogClosed())} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle component="div">
        <Stack spacing={1}>
          <Typography variant="h6" component="h2">
            {event.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDateTime(event.date, timezone)} · {event.location}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              color={event.availableTicketCount === 0 ? 'default' : 'success'}
              label={`${event.availableTicketCount} available`}
            />
            <Chip size="small" variant="outlined" label={formatPriceRange(event.minPrice, event.maxPrice, currency)} />
          </Stack>
        </Stack>
      </DialogTitle>

      <Divider />

      <Box sx={{ px: 3, py: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {FILTERS.map((filter) => (
            <Chip
              key={filter}
              size="small"
              label={FILTER_LABELS[filter]}
              color={statusFilter === filter ? 'primary' : 'default'}
              variant={statusFilter === filter ? 'filled' : 'outlined'}
              onClick={() => dispatch(statusFilterChanged(filter))}
            />
          ))}
        </Stack>
      </Box>

      <DialogContent dividers ref={contentRef} sx={{ minHeight: 320 }}>
        {status === 'failed' ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => dispatch(loadTicketsPage({ eventId: event.id, status: statusFilter, cursor: null }))}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : null}

        {status === 'idle' || status === 'loading' ? <TicketRowsSkeleton count={SKELETON_COUNT} /> : null}

        {status === 'succeeded' ? (
          <>
            {tickets.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography color="text.secondary">No tickets match this filter.</Typography>
              </Box>
            ) : (
              <List dense disablePadding>
                {tickets.map((ticket) => (
                  <ListItem key={ticket.id} divider disableGutters>
                    <ListItemText primary={`Ticket #${ticket.id}`} secondary={ticket.type} />
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Chip size="small" label={ticket.status} color={STATUS_COLORS[ticket.status] ?? 'default'} />
                      <Typography variant="body2">{formatPrice(ticket.price, currency)}</Typography>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            )}

            {moreStatus === 'loading' ? (
              <Box sx={{ pt: 1 }}>
                <TicketRowsSkeleton count={MORE_SKELETON_COUNT} />
              </Box>
            ) : null}

            {moreStatus === 'failed' ? (
              <Alert
                severity="error"
                sx={{ mt: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={handleLoadMore}>
                    Retry
                  </Button>
                }
              >
                {moreError}
              </Alert>
            ) : null}

            {nextCursor !== null ? <Box ref={sentinelRef} sx={{ height: 1 }} /> : null}

            {nextCursor === null && tickets.length > 0 ? (
              <Typography variant="caption" color="text.secondary" component="p" textAlign="center" sx={{ pt: 2 }}>
                {tickets.length} tickets loaded.
              </Typography>
            ) : null}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default EventTicketsDialog;
