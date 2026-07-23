import { request } from './client';
import { TicketsPage, TicketStatus } from './types';

interface TicketsPageRequest {
  eventId: number;
  status: TicketStatus | null;
  cursor: string | null;
  limit: number;
}

export const fetchTicketsPageRequest = async ({
  eventId,
  status,
  cursor,
  limit,
}: TicketsPageRequest): Promise<TicketsPage> => {
  const params = new URLSearchParams({ limit: String(limit) });

  if (cursor !== null) {
    params.set('cursor', cursor);
  }

  if (status !== null) {
    params.set('status', status);
  }

  return request<TicketsPage>(`/events/${eventId}/tickets?${params.toString()}`);
};
