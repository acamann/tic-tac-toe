import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { roomsApi } from "./services/rooms";
import { gamesApi } from "./services/games";

export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [roomsApi.reducerPath]: roomsApi.reducer,
    [gamesApi.reducerPath]: gamesApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(roomsApi.middleware, gamesApi.middleware),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);
