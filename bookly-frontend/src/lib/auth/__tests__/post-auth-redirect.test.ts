import {
  clearPostAuthRedirect,
  consumePostAuthRedirect,
  persistPostAuthRedirect,
  resolveDashboardFallbackPath,
  resolvePostAuthRedirect,
} from "@/lib/auth/post-auth-redirect";

describe("post-auth redirect resolver", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("returns internal callback path when callback query is present", () => {
    const target = resolvePostAuthRedirect({
      pathname: "/es/login",
      search: "?callback=/es/recursos",
      origin: "http://localhost:4200",
      locales: ["es", "en"],
    });

    expect(target).toBe("/es/recursos");
  });

  it("returns null for external callback URLs (open redirect protection)", () => {
    const target = resolvePostAuthRedirect({
      pathname: "/es/login",
      search: "?callback=https://evil.com/phishing",
      origin: "http://localhost:4200",
      locales: ["es", "en"],
    });

    expect(target).toBeNull();
  });

  it("returns null when no callback source exists", () => {
    const target = resolvePostAuthRedirect({
      pathname: "/es/login",
      search: "",
      origin: "http://localhost:4200",
      locales: ["es", "en"],
    });

    expect(target).toBeNull();
    expect(resolveDashboardFallbackPath("/es/login", ["es", "en"], "es")).toBe(
      "/es/dashboard",
    );
  });

  it("uses storage redirect when query/state are not present", () => {
    const target = resolvePostAuthRedirect({
      pathname: "/es/login",
      search: "",
      storageRedirect: "/es/reportes?tab=uso",
      origin: "http://localhost:4200",
      locales: ["es", "en"],
    });

    expect(target).toBe("/es/reportes?tab=uso");
  });

  it("consumes and clears stored redirect", () => {
    persistPostAuthRedirect("/es/reservas");

    expect(consumePostAuthRedirect()).toBe("/es/reservas");
    expect(window.sessionStorage.getItem("postAuthRedirect")).toBeNull();

    clearPostAuthRedirect();
    expect(window.sessionStorage.getItem("postAuthRedirect")).toBeNull();
  });

  it("ignores auth-entry loop targets and falls back later", () => {
    const target = resolvePostAuthRedirect({
      pathname: "/es/login",
      search: "?callback=/es/login",
      storageRedirect: "/es/auth/callback",
      origin: "http://localhost:4200",
      locales: ["es", "en"],
    });

    expect(target).toBeNull();
  });
});
