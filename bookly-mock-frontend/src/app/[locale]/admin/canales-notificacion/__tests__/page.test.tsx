/**
 * Tests for admin/canales-notificacion page (RF-27)
 */
import { render, screen, waitFor } from "@testing-library/react";

jest.mock("next-intl", () => ({
  useTranslations: () => (k: string) => k,
  useLocale: () => "es",
}));
jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/test",
  redirect: jest.fn(),
}));
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "u1",
      name: "Admin",
      email: "a@t.co",
      roles: [{ name: "admin" }],
    },
    isLoading: false,
    isAuthenticated: true,
    permissions: ["admin:all"],
  }),
}));
jest.mock("@/infrastructure/http/httpClient", () => ({
  httpClient: {
    get: jest.fn().mockResolvedValue({ success: true, data: [] }),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  isMockMode: () => true,
}));
jest.mock("@/hooks/useNotificationChannels", () => ({
  useNotificationChannels: () => ({ data: [], isLoading: false }),
  useNotificationPreferences: () => ({ data: [], isLoading: false }),
  useSaveNotificationPreferences: () => ({ mutate: jest.fn() }),
  useToggleChannel: () => ({ mutate: jest.fn() }),
}));

import CanalesNotificacionPage from "../page";

describe("CanalesNotificacionPage (RF-27)", () => {
  it("renders page content", async () => {
    render(<CanalesNotificacionPage />);
    await waitFor(() => {
      expect(
        screen.getAllByText(/canales de notificación/i).length,
      ).toBeGreaterThan(0);
    });
  });

  it("renders headings", async () => {
    render(<CanalesNotificacionPage />);
    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
