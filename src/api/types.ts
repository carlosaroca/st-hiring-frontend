export interface EventDto {
  id: number;
  name: string;
  description: string;
  location: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  availableTickets: Ticket[];
}

export interface EventSummary {
  id: number;
  name: string;
  description: string;
  location: string;
  date: string;
  availableTicketCount: number;
  minPrice: number | null;
  maxPrice: number | null;
}

export interface EventsPage {
  events: EventSummary[];
  nextCursor: string | null;
}

export const TICKET_STATUSES = ['available', 'sold', 'reserved'] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export interface Ticket {
  id: number;
  eventId: number;
  type: string;
  status: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketsPage {
  tickets: Ticket[];
  nextCursor: string | null;
}

export const CURRENCIES = ['USD', 'EUR', 'GBP'] as const;

export type Currency = (typeof CURRENCIES)[number];

export interface Settings {
  siteName: string;
  supportEmail: string;
  currency: Currency;
  timezone: string;
  maxTicketsPerOrder: number;
  salesEnabled: boolean;
  bannerMessage: string;
  updatedAt?: string;
}

export type SettingsInput = Omit<Settings, 'updatedAt'>;

export const DEFAULT_SETTINGS: SettingsInput = {
  siteName: 'See Tickets',
  supportEmail: 'support@seetickets.us',
  currency: 'USD',
  timezone: 'UTC',
  maxTicketsPerOrder: 10,
  salesEnabled: true,
  bannerMessage: '',
};
