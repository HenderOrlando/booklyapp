/**
 * Tests for reportes/conflictos page (RF-38)
 */
import { render, screen, waitFor } from "@testing-library/react";

jest.mock("next-intl", () => ({ useTranslations: () => (k: string) => k, useLocale: () => "es" }));
jest.mock("@/i18n/navigation", () => ({ Link: ({ children, href }: any) => <a href={href}>{children}</a>, useRouter: () => ({ push: jest.fn() }), usePathname: () => "/test", redirect: jest.fn() }));
jest.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "u1", name: "Admin", email: "a@t.co", roles: [{ name: "admin" }] }, isLoading: false, isAuthenticated: true, permissions: ["admin:all"] }) }));
jest.mock("@/infrastructure/http/httpClient", () => ({ httpClient: { get: jest.fn().mockResolvedValue({ success: true, data: [] }), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, isMockMode: () => true }));

import ConflictosPage from "../page";

describe("ConflictosPage (RF-38)", () => {
  it("renders page content", async () => {
    render(<ConflictosPage />);
    await waitFor(() => {
      expect(screen.getAllByText(/conflictos/i).length).toBeGreaterThan(0);
    });
  });

  it("renders headings", async () => {
    render(<ConflictosPage />);
    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
