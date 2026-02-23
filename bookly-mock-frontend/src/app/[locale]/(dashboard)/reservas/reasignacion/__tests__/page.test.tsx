/**
 * Tests for reservas/reasignacion page (RF-15)
 */
import { render, screen, waitFor } from "@testing-library/react";

jest.mock("next-intl", () => ({ useTranslations: () => (k: string) => k, useLocale: () => "es" }));
jest.mock("@/i18n/navigation", () => ({ Link: ({ children, href }: any) => <a href={href}>{children}</a>, useRouter: () => ({ push: jest.fn() }), usePathname: () => "/test", redirect: jest.fn() }));
jest.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "u1", name: "Admin", email: "a@t.co", roles: [{ name: "admin" }] }, isLoading: false, isAuthenticated: true, permissions: ["admin:all"] }) }));
jest.mock("@/infrastructure/http/httpClient", () => ({ httpClient: { get: jest.fn().mockResolvedValue({ success: true, data: [] }), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, isMockMode: () => true }));
jest.mock("@/hooks/useReassignment", () => ({
  useReassignment: () => ({
    useHistory: () => ({ data: [], isLoading: false, error: null }),
    usePending: () => ({ data: [], isLoading: false, error: null }),
    respondToReassignment: { mutate: jest.fn(), mutateAsync: jest.fn(), isPending: false },
    requestReassignment: { mutate: jest.fn(), isPending: false },
  }),
}));

import ReasignacionPage from "../page";

describe("ReasignacionPage (RF-15)", () => {
  it("renders page content", async () => {
    render(<ReasignacionPage />);
    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  it("renders headings", async () => {
    render(<ReasignacionPage />);
    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
