/**
 * Shared mock setup for page-level tests.
 * Import this BEFORE any component imports in page tests.
 */

// Mock next/navigation (used by LogoutButton and other Next.js components)
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/test",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "es",
}));

// Mock i18n navigation
jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: any) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createElement } = require("react");
    return createElement("a", { href, ...props }, children);
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/test",
  redirect: jest.fn(),
}));

// Mock AuthContext
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "user-001",
      name: "Admin Test",
      email: "admin@ufps.edu.co",
      roles: [{ name: "admin" }],
    },
    isLoading: false,
    isAuthenticated: true,
    permissions: ["resources:read", "resources:write", "admin:all"],
  }),
}));

// Mock httpClient
jest.mock("@/infrastructure/http/httpClient", () => ({
  httpClient: {
    get: jest.fn().mockResolvedValue({ success: true, data: [] }),
    post: jest.fn().mockResolvedValue({ success: true, data: {} }),
    put: jest.fn().mockResolvedValue({ success: true, data: {} }),
    patch: jest.fn().mockResolvedValue({ success: true, data: {} }),
    delete: jest.fn().mockResolvedValue({ success: true, data: {} }),
  },
  isMockMode: () => true,
}));

// Dummy test to prevent "must contain at least one test" error
test("page-test-setup loads without errors", () => {
  expect(true).toBe(true);
});

export {};
