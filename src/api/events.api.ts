import { request } from './client';
import { EventDto, EventsPage, EventSummary } from './types';

const toEventSummary = (event: EventDto): EventSummary => {
  const prices = (event.availableTickets ?? []).map((ticket) => ticket.price);

  return {
    id: event.id,
    name: event.name,
    description: event.description,
    location: event.location,
    date: event.date,
    availableTicketCount: prices.length,
    minPrice: prices.length > 0 ? Math.min(...prices) : null,
    maxPrice: prices.length > 0 ? Math.max(...prices) : null,
  };
};

const byDateAscending = (a: EventSummary, b: EventSummary): number => Date.parse(a.date) - Date.parse(b.date);

export const fetchEventsRequest = async (): Promise<EventSummary[]> => {
  const events = await request<EventDto[]>('/events');

  return events.map(toEventSummary).sort(byDateAscending);
};

interface EventsPageRequest {
  search: string;
  cursor: string | null;
  limit: number;
}

export const fetchEventsPageRequest = async ({ search, cursor, limit }: EventsPageRequest): Promise<EventsPage> => {
  const params = new URLSearchParams({ limit: String(limit) });

  if (cursor !== null) {
    params.set('cursor', cursor);
  }

  if (search !== '') {
    params.set('q', search);
  }

  return request<EventsPage>(`/events/paginated?${params.toString()}`);
};
