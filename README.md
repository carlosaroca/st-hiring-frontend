# Eventim Frontend Test

Welcome to the Eventim frontend test for new hires (Mid Level). The purpose of this test is to build a React UI that integrates with the backend API.

## Tech Stack

- Node 22
- React 18 + TypeScript
- Vite
- MUI (Material UI v5)
- Redux Toolkit
- Formik + Yup

All dependencies are already installed — no need to add them.

## Requirements

- NVM (to switch to the correct Node version)
- The backend API must be running on `http://localhost:3000` before you start the frontend

## Setup

1. Fork this repository into your own GitHub account
2. Clone the fork to your machine
3. Run `nvm use` to switch to the correct Node version
4. Run `yarn install` to install dependencies
5. Run `yarn dev` to start the development server

The Vite dev server proxies `/events` and `/settings` to the backend automatically, so no extra configuration is needed.

## Tasks

### 1. Events list

Consume `GET /events` from the backend and display the list of events. Each event should show its relevant information.

- Use MUI components to build the UI
- The layout should be responsive
- Use Redux to manage the events state

### 2. Settings form

Build a form that reads and updates a settings object via the backend API (`GET /settings` and `POST /settings`).

- Use MUI components to build the form
- The layout should be responsive
- Use Redux to manage the settings state
- Use Formik for the form and Yup for validation

## Implementation notes

### Structure

```
src/
  api/         HTTP layer: typed responses, fetch wrapper and error handling
  app/         store, typed hooks, shared types and MUI theme
  features/
    events/    events slice, list and card
    settings/  settings slice, Yup schema and Formik form
  hooks/       debounce and intersection observer
  utils/       date and currency formatting
```

### Decisions

- **The API is consumed through a small mapping layer.** `src/api/types.ts` types each response and
  `src/api/events.api.ts` turns the raw event DTO into the `EventSummary` the UI actually renders, so the
  components never depend on the exact wire shape.
- **Tickets are aggregated at the boundary.** `GET /events` returns up to 500 ticket objects per event; the store
  only keeps what the UI renders (available count and price range) instead of thousands of unused objects.
- **`price` is treated as minor units** (an integer column, so `1000` renders as `10.00`) and formatted with
  `Intl.NumberFormat` using the currency from settings.
- **Validation is mirrored**, not shared: Yup validates in the browser for immediate feedback, the API remains the
  source of truth, and any `400` field errors it returns are mapped back onto the matching Formik fields.
- **Settings drive the UI**: the site name is used in the app bar, the banner message is rendered as an alert, and
  the currency and timezone are applied when formatting events.

### Advanced mode

The events list can run against either backend endpoint. The floating button in the bottom right corner
(**Advanced mode**) switches between them, and a pill next to the heading shows which one is active:

| | Advanced (default) | Simple |
| --- | --- | --- |
| Endpoint | `GET /events/paginated` | `GET /events` |
| Loading | 12 events per page, cursor based | the whole list at once |
| Search | `?q=` on the server | filtered in the browser |

Advanced is the default because it is the behaviour this app should ship with: the same 50 events cost 1 query
and 15 KB instead of 51 queries and 1.3 MB. Simple mode is not a fallback — it is the endpoint task 1 asks for,
still wired to the UI and one click away, so both paths stay exercised and neither is dead code.

- **Infinite scroll uses `IntersectionObserver`**, not a scroll listener and not a virtualisation library: a
  sentinel below the grid requests the next page when it comes within 300px of the viewport. No new dependency.
- **Search is debounced by 300ms** and, in paginated mode, resets the cursor — a new term always starts a new
  page 1.
- **Out-of-order responses are discarded.** Typing quickly means several requests are in flight at once, and they
  can resolve out of order. Every fulfilled page carries the term it was requested with, and the reducer drops it
  if that term is no longer the current one, so a slow response for `mad` cannot overwrite the results for
  `madrid`.
- **Paging errors are separate from loading errors.** A failed page keeps the events already on screen and offers
  a retry underneath them, instead of replacing the list with an error.
- **Every loading state is a skeleton**, shaped like the content it is about to be replaced by, including the one
  for the next page: the incoming events appear as skeleton cards continuing the grid rather than as a spinner
  below it, so the page does not jump when they resolve.

### Event tickets

Clicking an event opens a dialog with its tickets, filterable by status and paginated against
`GET /events/:eventId/tickets`. The card only knows the aggregates (`availableTicketCount`, `minPrice`,
`maxPrice`), which is what makes the listing cheap; the individual rows are fetched on demand, for one event, and
only when someone asks for them.

- **The dialog is code split.** It is the only part of the app that is not needed to render the first screen, so
  it loads on the first click (`19 kB` in its own chunk) instead of shipping with the initial bundle.
- **Infinite scroll inside the dialog** reuses the same `IntersectionObserver` hook, with the dialog's scroll
  container passed as the observer root instead of the viewport.
- **The status filter resets the cursor**, and the same stale-response guard used by the search applies here: a
  page is discarded if its event or its filter is no longer the current one.
