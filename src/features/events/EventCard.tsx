import { Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';
import { EventSummary } from '../../api/types';
import { formatDateTime, formatPriceRange } from '../../utils/format';

interface EventCardProps {
  event: EventSummary;
  currency: string;
  timezone: string;
  onSelect: (event: EventSummary) => void;
}

const EventCard = ({ event, currency, timezone, onSelect }: EventCardProps) => {
  const soldOut = event.availableTicketCount === 0;

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardActionArea
        onClick={() => onSelect(event)}
        aria-label={`Show the tickets of ${event.name}`}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1, width: '100%' }}>
          <Typography variant="h6" component="h2" sx={{ lineHeight: 1.3 }}>
            {event.name}
          </Typography>

          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {formatDateTime(event.date, timezone)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {event.location}
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            sx={{
              flexGrow: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.description}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 'auto', pt: 1 }}>
            <Chip
              size="small"
              color={soldOut ? 'default' : 'success'}
              variant={soldOut ? 'outlined' : 'filled'}
              label={soldOut ? 'Sold out' : `${event.availableTicketCount} tickets left`}
            />
            {!soldOut && (
              <Chip size="small" variant="outlined" label={formatPriceRange(event.minPrice, event.maxPrice, currency)} />
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default EventCard;
