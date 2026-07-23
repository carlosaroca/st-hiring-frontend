import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchTicketsPageRequest } from '../../api/tickets.api';
import { EventSummary, Ticket, TicketsPage, TicketStatus } from '../../api/types';
import type { RootState } from '../../app/store';
import type { RequestStatus } from '../../app/types';

export type TicketStatusFilter = TicketStatus | 'all';

const TICKETS_PAGE_SIZE = 25;

interface LoadTicketsPageArgs {
  eventId: number;
  status: TicketStatusFilter;
  cursor: string | null;
}

interface TicketsState {
  event: EventSummary | null;
  items: Ticket[];
  status: RequestStatus;
  error: string | null;
  statusFilter: TicketStatusFilter;
  nextCursor: string | null;
  moreStatus: RequestStatus;
  moreError: string | null;
}

const initialState: TicketsState = {
  event: null,
  items: [],
  status: 'idle',
  error: null,
  statusFilter: 'all',
  nextCursor: null,
  moreStatus: 'idle',
  moreError: null,
};

export const loadTicketsPage = createAsyncThunk<TicketsPage, LoadTicketsPageArgs, { state: RootState }>(
  'tickets/loadTicketsPage',
  ({ eventId, status, cursor }) =>
    fetchTicketsPageRequest({
      eventId,
      status: status === 'all' ? null : status,
      cursor,
      limit: TICKETS_PAGE_SIZE,
    }),
  {
    condition: ({ cursor }, { getState }) => cursor === null || getState().tickets.moreStatus !== 'loading',
  },
);

const resetList = (state: TicketsState) => {
  state.items = [];
  state.status = 'idle';
  state.error = null;
  state.nextCursor = null;
  state.moreStatus = 'idle';
  state.moreError = null;
};

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    eventOpened: (state, action: PayloadAction<EventSummary>) => {
      state.event = action.payload;
      state.statusFilter = 'all';
      resetList(state);
    },
    dialogClosed: (state) => {
      state.event = null;
      state.statusFilter = 'all';
      resetList(state);
    },
    statusFilterChanged: (state, action: PayloadAction<TicketStatusFilter>) => {
      if (state.statusFilter === action.payload) {
        return;
      }

      state.statusFilter = action.payload;
      resetList(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTicketsPage.pending, (state, action) => {
        if (action.meta.arg.cursor === null) {
          state.status = 'loading';
          state.error = null;
          return;
        }

        state.moreStatus = 'loading';
        state.moreError = null;
      })
      .addCase(loadTicketsPage.fulfilled, (state, action) => {
        const { eventId, status, cursor } = action.meta.arg;

        if (eventId !== state.event?.id || status !== state.statusFilter) {
          return;
        }

        if (cursor === null) {
          state.status = 'succeeded';
          state.items = action.payload.tickets;
        } else {
          state.moreStatus = 'succeeded';
          state.items.push(...action.payload.tickets);
        }

        state.nextCursor = action.payload.nextCursor;
      })
      .addCase(loadTicketsPage.rejected, (state, action) => {
        if (action.meta.condition) {
          return;
        }

        if (action.meta.arg.cursor === null) {
          state.status = 'failed';
          state.error = action.error.message ?? 'Unable to load the tickets';
          return;
        }

        state.moreStatus = 'failed';
        state.moreError = action.error.message ?? 'Unable to load more tickets';
      });
  },
});

export const { eventOpened, dialogClosed, statusFilterChanged } = ticketsSlice.actions;

export const selectTicketsEvent = (state: RootState) => state.tickets.event;

export const selectTickets = (state: RootState) => state.tickets.items;

export const selectTicketsStatus = (state: RootState) => state.tickets.status;

export const selectTicketsError = (state: RootState) => state.tickets.error;

export const selectTicketsStatusFilter = (state: RootState) => state.tickets.statusFilter;

export const selectTicketsNextCursor = (state: RootState) => state.tickets.nextCursor;

export const selectTicketsMoreStatus = (state: RootState) => state.tickets.moreStatus;

export const selectTicketsMoreError = (state: RootState) => state.tickets.moreError;

export default ticketsSlice.reducer;
