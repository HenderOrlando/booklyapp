/**
 * Shared test utilities for page-level tests.
 * Provides common mocks for next-intl, AuthContext, and httpClient.
 */

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "es",
}));

// Mock navigation
jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
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
const mockHttpClient = {
  get: jest.fn().mockResolvedValue({ success: true, data: [] }),
  post: jest.fn().mockResolvedValue({ success: true, data: {} }),
  put: jest.fn().mockResolvedValue({ success: true, data: {} }),
  patch: jest.fn().mockResolvedValue({ success: true, data: {} }),
  delete: jest.fn().mockResolvedValue({ success: true, data: {} }),
};

jest.mock("@/infrastructure/http/httpClient", () => ({
  httpClient: mockHttpClient,
  isMockMode: () => true,
}));

export { mockHttpClient };
