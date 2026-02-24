/**
 * Tests for admin/evaluaciones page (RF-35)
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
jest.mock("@/hooks/useEvaluations", () => ({
  useEvaluations: () => ({ data: [], isLoading: false }),
  useSaveEvaluation: () => ({ mutate: jest.fn(), isLoading: false }),
}));
import { render, screen, waitFor } from "@testing-library/react";
import EvaluacionesPage from "../page";

describe("EvaluacionesPage (RF-35)", () => {
  it("renders page title", async () => {
    render(<EvaluacionesPage />);
    await waitFor(() => {
      expect(screen.getByText(/evaluaciones/i)).toBeInTheDocument();
    });
  });

  it("renders evaluation list or table", async () => {
    render(<EvaluacionesPage />);
    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
