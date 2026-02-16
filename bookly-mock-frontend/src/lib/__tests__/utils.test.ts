import {
  cn,
  formatBytes,
  formatDate,
  formatDateTime,
  generateId,
  getInitials,
  isValidEmail,
  parseApiError,
  truncate,
} from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts", () => {
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });
});

describe("formatDate", () => {
  it("formats date in Spanish locale", () => {
    const result = formatDate("2026-02-16T12:00:00Z", "es-ES");
    expect(result).toContain("2026");
    expect(result).toContain("febrero");
  });
});

describe("formatDateTime", () => {
  it("formats date with time", () => {
    const result = formatDateTime("2026-02-16T14:30:00Z", "es-ES");
    expect(result).toContain("2026");
  });
});

describe("getInitials", () => {
  it("returns first two initials", () => {
    expect(getInitials("Juan Pérez")).toBe("JP");
  });

  it("handles single name", () => {
    expect(getInitials("Admin")).toBe("A");
  });

  it("handles three names", () => {
    expect(getInitials("Juan Carlos Pérez")).toBe("JC");
  });
});

describe("truncate", () => {
  it("truncates long text with ellipsis", () => {
    expect(truncate("Hello World This Is Long", 10)).toBe("Hello Worl...");
  });

  it("returns original text if shorter than limit", () => {
    expect(truncate("Short", 10)).toBe("Short");
  });

  it("returns original text if equal to limit", () => {
    expect(truncate("Exact", 5)).toBe("Exact");
  });
});

describe("parseApiError", () => {
  it("extracts message from API response", () => {
    const error = { response: { data: { message: "Not found" } } };
    expect(parseApiError(error)).toBe("Not found");
  });

  it("falls back to error.message", () => {
    const error = { message: "Network error" };
    expect(parseApiError(error)).toBe("Network error");
  });

  it("returns default message for unknown errors", () => {
    expect(parseApiError({})).toBe("Ha ocurrido un error inesperado");
  });

  it("handles null/undefined", () => {
    expect(parseApiError(null)).toBe("Ha ocurrido un error inesperado");
  });
});

describe("formatBytes", () => {
  it("formats 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
  });

  it("formats KB", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("formats MB", () => {
    expect(formatBytes(1048576)).toBe("1 MB");
  });

  it("formats with decimals", () => {
    expect(formatBytes(1536, 1)).toBe("1.5 KB");
  });
});

describe("generateId", () => {
  it("returns a string", () => {
    expect(typeof generateId()).toBe("string");
  });

  it("returns unique values", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

describe("isValidEmail", () => {
  it("validates correct email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("validates institutional email", () => {
    expect(isValidEmail("admin@ufps.edu.co")).toBe(true);
  });

  it("rejects email without @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("rejects email without domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });
});
