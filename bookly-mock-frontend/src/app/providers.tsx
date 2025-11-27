"use client";

import { ToastContainer } from "@/components/organisms/ToastContainer";
import { AuthProvider } from "@/contexts/AuthContext";
import { WebSocketProvider } from "@/infrastructure/websocket/WebSocketProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { store } from "@/store/store";
import { ThemeProvider } from "next-themes";
import { Provider as ReduxProvider } from "react-redux";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <QueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <WebSocketProvider>
              {children}
              <ToastContainer />
            </WebSocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}
