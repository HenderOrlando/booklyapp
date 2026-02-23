import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthClient } from "@/infrastructure/api/auth-client";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const locationReplaceSpy = jest.fn();

// Replace window.location to allow mocking replace() (which is read-only in jsdom)
Object.defineProperty(window, "location", {
  configurable: true,
  writable: true,
  value: {
    pathname: "/es/login",
    search: "",
    origin: "http://localhost",
    href: "http://localhost/es/login",
    replace: locationReplaceSpy,
    assign: jest.fn(),
    reload: jest.fn(),
  },
});

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    showError: jest.fn(),
    showWarning: jest.fn(),
    showSuccess: jest.fn(),
    showInfo: jest.fn(),
  }),
}));

jest.mock("@/infrastructure/http/errorMessageResolver", () => ({
  resolveErrorMessage: jest.fn(() => ""),
}));

jest.mock("@/infrastructure/api/auth-client", () => ({
  AuthClient: {
    login: jest.fn(),
    getProfile: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  },
}));

function LoginHarness() {
  const { login } = useAuth();

  return (
    <button
      data-testid="auth-context-login-trigger"
      onClick={() => void login("admin@ufps.edu.co", "admin123", false)}
    >
      Login
    </button>
  );
}

describe("AuthContext post-auth redirect", () => {
  beforeEach(() => {
    pushMock.mockReset();
    locationReplaceSpy.mockReset();

    window.localStorage.clear();
    window.sessionStorage.clear();

    (AuthClient.login as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        user: {
          id: "user-1",
          email: "admin@ufps.edu.co",
          firstName: "Admin",
          lastName: "UFPS",
          roles: [],
          permissions: [],
        },
        tokens: {
          accessToken: "test-access-token",
          refreshToken: "test-refresh-token",
        },
      },
    });
  });

  it("redirects to callback when login succeeds with callback query", async () => {
    const user = userEvent.setup();
    // Set mock location URL for this test
    const mockLoc = window.location as unknown as Record<string, unknown>;
    mockLoc.pathname = "/es/login";
    mockLoc.search = "?callback=/es/recursos";

    render(
      <AuthProvider>
        <LoginHarness />
      </AuthProvider>,
    );

    await user.click(screen.getByTestId("auth-context-login-trigger"));

    await waitFor(() => {
      expect(locationReplaceSpy).toHaveBeenCalledWith("/es/recursos");
    });

    expect(locationReplaceSpy).toHaveBeenCalledTimes(1);
  });

  it("redirects to dashboard when login succeeds without callback", async () => {
    const user = userEvent.setup();
    // Set mock location URL for this test (no callback)
    const mockLoc = window.location as unknown as Record<string, unknown>;
    mockLoc.pathname = "/es/login";
    mockLoc.search = "";

    render(
      <AuthProvider>
        <LoginHarness />
      </AuthProvider>,
    );

    await user.click(screen.getByTestId("auth-context-login-trigger"));

    await waitFor(() => {
      expect(locationReplaceSpy).toHaveBeenCalledWith("/es/dashboard");
    });

    expect(locationReplaceSpy).toHaveBeenCalledTimes(1);
  });
});
