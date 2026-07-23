import { configureStore } from '@reduxjs/toolkit';
import eventsReducer from '../features/events/eventsSlice';
import settingsReducer from '../features/settings/settingsSlice';
import ticketsReducer from '../features/tickets/ticketsSlice';

export const store = configureStore({
  reducer: {
    events: eventsReducer,
    settings: settingsReducer,
    tickets: ticketsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
