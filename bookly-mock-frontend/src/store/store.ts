/**
 * Redux Store Principal - Bookly Frontend
 * Configurado con Redux Toolkit
 */

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { config } from "@/lib/config";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    // Agregar más reducers aquí según sea necesario
    // resources: resourcesReducer,
    // reservations: reservationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar acciones específicas si es necesario
        ignoredActions: ["persist/PERSIST"],
      },
    }),
  devTools: !config.isProduction,
});

// Setup listeners para refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Tipos para TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
