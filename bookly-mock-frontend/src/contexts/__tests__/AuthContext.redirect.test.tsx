import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthClient } from "@/infrastructure/api/auth-client";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const replaceMock = jest.fn();
const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
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
    replaceMock.mockReset();
    pushMock.mockReset();

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
    window.history.replaceState({}, "", "/es/login?callback=/es/recursos");

    render(
      <AuthProvider>
        <LoginHarness />
      </AuthProvider>,
    );

    await user.click(screen.getByTestId("auth-context-login-trigger"));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/es/recursos");
    });

    expect(replaceMock).toHaveBeenCalledTimes(1);
  });

  it("redirects to dashboard when login succeeds without callback", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/es/login");

    render(
      <AuthProvider>
        <LoginHarness />
      </AuthProvider>,
    );

    await user.click(screen.getByTestId("auth-context-login-trigger"));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/es/dashboard");
    });

    expect(replaceMock).toHaveBeenCalledTimes(1);
  });
});
