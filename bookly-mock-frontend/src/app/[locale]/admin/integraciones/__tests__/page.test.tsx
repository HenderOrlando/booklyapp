/**
 * Tests for admin/integraciones page (RF-08)
 */
import { render, screen, waitFor } from "@testing-library/react";

jest.mock("next-intl", () => ({ useTranslations: () => (k: string) => k, useLocale: () => "es" }));
jest.mock("@/i18n/navigation", () => ({ Link: ({ children, href }: any) => <a href={href}>{children}</a>, useRouter: () => ({ push: jest.fn() }), usePathname: () => "/test", redirect: jest.fn() }));
jest.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "u1", name: "Admin", email: "a@t.co", roles: [{ name: "admin" }] }, isLoading: false, isAuthenticated: true, permissions: ["admin:all"] }) }));
jest.mock("@/infrastructure/http/httpClient", () => ({ httpClient: { get: jest.fn().mockResolvedValue({ success: true, data: [] }), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, isMockMode: () => true }));

import IntegracionesPage from "../page";

describe("IntegracionesPage (RF-08)", () => {
  it("renders page content", async () => {
    render(<IntegracionesPage />);
    await waitFor(() => {
      expect(screen.getAllByText(/integraciones/i).length).toBeGreaterThan(0);
    });
  });

  it("renders headings", async () => {
    render(<IntegracionesPage />);
    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
