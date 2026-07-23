import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchEventsPageRequest, fetchEventsRequest } from '../../api/events.api';
import { EventsPage, EventSummary } from '../../api/types';
import type { RootState } from '../../app/store';
import type { RequestStatus } from '../../app/types';

type EventsMode = 'all' | 'paginated';

const EVENTS_PAGE_SIZE = 12;

interface LoadEventsPageArgs {
  search: string;
  cursor: string | null;
}

interface EventsState {
  items: EventSummary[];
  status: RequestStatus;
  error: string | null;
  mode: EventsMode;
  search: string;
  nextCursor: string | null;
  moreStatus: RequestStatus;
  moreError: string | null;
}

const initialState: EventsState = {
  items: [],
  status: 'idle',
  error: null,
  mode: 'paginated',
  search: '',
  nextCursor: null,
  moreStatus: 'idle',
  moreError: null,
};

export const fetchEvents = createAsyncThunk('events/fetchEvents', () => fetchEventsRequest());

export const loadEventsPage = createAsyncThunk<EventsPage, LoadEventsPageArgs, { state: RootState }>(
  'events/loadEventsPage',
  ({ search, cursor }) => fetchEventsPageRequest({ search, cursor, limit: EVENTS_PAGE_SIZE }),
  {
    condition: ({ cursor }, { getState }) => cursor === null || getState().events.moreStatus !== 'loading',
  },
);

const resetList = (state: EventsState) => {
  state.items = [];
  state.status = 'idle';
  state.error = null;
  state.nextCursor = null;
  state.moreStatus = 'idle';
  state.moreError = null;
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    modeChanged: (state, action: PayloadAction<EventsMode>) => {
      if (state.mode === action.payload) {
        return;
      }

      state.mode = action.payload;
      resetList(state);
    },
    searchChanged: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to load the events';
      })
      .addCase(loadEventsPage.pending, (state, action) => {
        if (action.meta.arg.cursor === null) {
          state.status = 'loading';
          state.error = null;
          return;
        }

        state.moreStatus = 'loading';
        state.moreError = null;
      })
      .addCase(loadEventsPage.fulfilled, (state, action) => {
        if (action.meta.arg.search !== state.search) {
          return;
        }

        if (action.meta.arg.cursor === null) {
          state.status = 'succeeded';
          state.items = action.payload.events;
        } else {
          state.moreStatus = 'succeeded';
          state.items.push(...action.payload.events);
        }

        state.nextCursor = action.payload.nextCursor;
      })
      .addCase(loadEventsPage.rejected, (state, action) => {
        if (action.meta.condition) {
          return;
        }

        if (action.meta.arg.cursor === null) {
          state.status = 'failed';
          state.error = action.error.message ?? 'Unable to load the events';
          return;
        }

        state.moreStatus = 'failed';
        state.moreError = action.error.message ?? 'Unable to load more events';
      });
  },
});

export const { modeChanged, searchChanged } = eventsSlice.actions;

export const selectEvents = (state: RootState) => state.events.items;

export const selectEventsStatus = (state: RootState) => state.events.status;

export const selectEventsError = (state: RootState) => state.events.error;

export const selectEventsMode = (state: RootState) => state.events.mode;

export const selectEventsSearch = (state: RootState) => state.events.search;

export const selectEventsNextCursor = (state: RootState) => state.events.nextCursor;

export const selectEventsMoreStatus = (state: RootState) => state.events.moreStatus;

export const selectEventsMoreError = (state: RootState) => state.events.moreError;

export default eventsSlice.reducer;
