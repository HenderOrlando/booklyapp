import LoginPage from "@/app/[locale]/login/page";
import { useDataMode } from "@/hooks/useDataMode";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const loginMock = jest.fn();
const setThemeMock = jest.fn();

let currentTheme: "light" | "dark" | "system" = "light";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    login: loginMock,
    isLoading: false,
  }),
}));

jest.mock("@/hooks/useDataMode", () => ({
  useDataMode: jest.fn(),
}));

jest.mock("@/infrastructure/http/errorMessageResolver", () => ({
  resolveErrorMessage: jest.fn(() => ""),
}));

jest.mock("@/hooks/useAppConfig", () => ({
  usePublicConfig: () => ({
    data: undefined,
    isLoading: false,
  }),
}));

const translations: Record<string, Record<string, string>> = {
  auth: {
    login: "Iniciar Sesión",
    description: "Ingrese sus credenciales institucionales",
    institutional_email: "Correo Institucional",
    password: "Contraseña",
    remember: "Recordarme",
    forgot_password: "¿Olvidaste tu contraseña?",
    logging_in: "Iniciando sesión...",
    no_account: "¿No tienes cuenta?",
    register_link: "Regístrate aquí",
    test_credentials: "Credenciales de Prueba",
    theme_toggle_label: "Tema",
    mock_mode_disclaimer: "Disponible solo para entorno de pruebas (MOCK).",
    server_credentials_hint:
      "Usa tus credenciales institucionales para ingresar.",
    default_error: "Credenciales inválidas",
  },
  errors: {
    "auth.default": "Error de autenticación",
  },
};

jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    translations[namespace]?.[key] ?? key,
}));

jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: currentTheme,
    systemTheme: "light",
    setTheme: (nextTheme: "light" | "dark" | "system") => {
      currentTheme = nextTheme;
      if (typeof window !== "undefined") {
        if (nextTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        window.localStorage.setItem("theme", nextTheme);
      }
      setThemeMock(nextTheme);
    },
  }),
}));

describe("LoginPage UI/UX", () => {
  beforeEach(() => {
    loginMock.mockReset();
    setThemeMock.mockReset();
    currentTheme = "light";
    document.documentElement.classList.remove("dark");
    window.localStorage.clear();

    (useDataMode as unknown as jest.Mock).mockReturnValue({
      isMock: true,
    });
  });

  it("shows mock credentials only when app is in MOCK mode", () => {
    render(<LoginPage />);

    expect(screen.getByTestId("login-mock-credentials")).toBeInTheDocument();
    expect(
      screen.queryByTestId("login-server-credentials-hint"),
    ).not.toBeInTheDocument();
  });

  it("hides mock credentials and shows institutional hint in SERVER mode", () => {
    (useDataMode as unknown as jest.Mock).mockReturnValue({
      isMock: false,
    });

    render(<LoginPage />);

    expect(
      screen.queryByTestId("login-mock-credentials"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId("login-server-credentials-hint"),
    ).toBeInTheDocument();
  });

  it("toggles dark/light theme and persists the selected preference", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<LoginPage />);

    const toggle = await screen.findByTestId("login-theme-toggle");

    expect(document.documentElement).not.toHaveClass("dark");
    expect(window.localStorage.getItem("theme")).toBeNull();

    await user.click(toggle);

    expect(setThemeMock).toHaveBeenCalledWith("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.getItem("theme")).toBe("dark");

    rerender(<LoginPage />);
    await user.click(await screen.findByTestId("login-theme-toggle"));

    expect(setThemeMock).toHaveBeenLastCalledWith("light");
    expect(document.documentElement).not.toHaveClass("dark");
    expect(window.localStorage.getItem("theme")).toBe("light");
  });

  it("applies high-contrast primary button token classes for light mode", () => {
    render(<LoginPage />);

    const submitButton = screen.getByTestId("login-submit-btn");

    expect(submitButton.className).toContain(
      "bg-[var(--color-action-primary)]",
    );
    expect(submitButton.className).toContain(
      "hover:bg-[var(--color-action-primary-hover)]",
    );
    expect(submitButton.className).toContain(
      "focus-visible:ring-[var(--color-border-focus)]",
    );
  });

  it("persists remember me preference in localStorage", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const rememberCheckbox = screen.getByLabelText("Recordarme");

    expect(rememberCheckbox).not.toBeChecked();
    expect(window.localStorage.getItem("rememberMe")).toBe("false");

    await user.click(rememberCheckbox);

    expect(rememberCheckbox).toBeChecked();
    expect(window.localStorage.getItem("rememberMe")).toBe("true");
  });
});
