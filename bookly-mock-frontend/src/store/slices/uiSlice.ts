/**
 * UI Slice - Manejo de estado de la interfaz de usuario
 * Controla: modals, notifications, sidebar, theme, loading global
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // ms, undefined = no auto-dismiss
}

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Theme
  theme: "light" | "dark" | "system";

  // Loading global
  isGlobalLoading: boolean;
  loadingMessage: string | null;

  // Notificaciones
  notifications: Notification[];

  // Modals
  activeModal: string | null;
  modalData: any;
}

const initialState: UIState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: "system",
  isGlobalLoading: false,
  loadingMessage: null,
  notifications: [],
  activeModal: null,
  modalData: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    // Theme
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload;

      // Guardar en localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", action.payload);
      }
    },

    // Loading global
    setGlobalLoading: (
      state,
      action: PayloadAction<{ isLoading: boolean; message?: string }>
    ) => {
      state.isGlobalLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message || null;
    },

    // Notificaciones
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Modals
    openModal: (
      state,
      action: PayloadAction<{ modal: string; data?: any }>
    ) => {
      state.activeModal = action.payload.modal;
      state.modalData = action.payload.data || null;
    },

    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setTheme,
  setGlobalLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
