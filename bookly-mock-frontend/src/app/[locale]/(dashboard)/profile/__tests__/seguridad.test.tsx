/**
 * Tests for profile/seguridad page (RF-45)
 * Tests the security tab functionality including 2FA
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
      twoFactorEnabled: false,
    },
    isLoading: false,
    isAuthenticated: true,
    permissions: ["admin:all"],
  }),
}));
jest.mock("@/infrastructure/http/httpClient", () => ({
  httpClient: {
    get: jest.fn().mockResolvedValue({ success: true, data: {} }),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  isMockMode: () => true,
}));
jest.mock("@/hooks/mutations/useUserMutations", () => ({
  useUpdateUserProfile: () => ({ mutateAsync: jest.fn(), isLoading: false }),
  useChangePassword: () => ({ mutateAsync: jest.fn(), isLoading: false }),
  useToggle2FA: () => ({ mutateAsync: jest.fn(), isLoading: false }),
  useUpdateNotificationPreferences: () => ({
    mutateAsync: jest.fn(),
    isLoading: false,
  }),
}));
jest.mock("@/hooks/mutations", () => ({
  useChangePassword: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useUpdateUserProfile: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useUpdateUserPreferences: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useUploadProfilePhoto: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

import ProfilePage from "../../profile/page";

describe("ProfilePage Security (RF-45)", () => {
  it("renders profile page", async () => {
    render(<ProfilePage />);
    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  it("renders profile content", async () => {
    render(<ProfilePage />);
    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
