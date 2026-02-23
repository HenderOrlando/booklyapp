/**
 * Tests for reportes/demanda-insatisfecha page (RF-37)
 */
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
jest.mock("@/hooks/useReportData", () => ({
  useUnsatisfiedDemandReport: () => ({ data: [], isLoading: false }),
  useComplianceReport: () => ({ data: [], isLoading: false }),
  useReportDashboard: () => ({ data: null, isLoading: false }),
}));
import { render, screen, waitFor } from "@testing-library/react";
import DemandaInsatisfechaPage from "../page";

describe("DemandaInsatisfechaPage (RF-37)", () => {
  it("renders page title", async () => {
    render(<DemandaInsatisfechaPage />);
    await waitFor(() => {
      expect(screen.getByText("unsatisfied_demand_title")).toBeInTheDocument();
    });
  });

  it("renders report content", async () => {
    render(<DemandaInsatisfechaPage />);
    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
