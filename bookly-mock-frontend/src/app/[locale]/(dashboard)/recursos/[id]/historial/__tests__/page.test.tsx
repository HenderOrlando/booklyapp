/**
 * Tests for recursos/[id]/historial page (RF-11)
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
jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "res_001", locale: "es" }),
  useRouter: () => ({ push: jest.fn() }),
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
    get: jest
      .fn()
      .mockResolvedValue({
        success: true,
        data: {
          id: "res_001",
          name: "Sala A101",
          code: "SALA-101",
          type: "CLASSROOM",
        },
      }),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  isMockMode: () => true,
}));

import HistorialPage from "../page";

describe("HistorialPage (RF-11)", () => {
  it("renders page content", async () => {
    render(<HistorialPage />);
    await waitFor(() => {
      expect(screen.getAllByText(/historial/i).length).toBeGreaterThan(0);
    });
  });

  it("renders headings", async () => {
    render(<HistorialPage />);
    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
