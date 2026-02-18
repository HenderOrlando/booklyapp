import {
  extractControllerPrefix,
  resolveDirectServiceKey,
} from "@/infrastructure/data-providers/endpoint-routing";

describe("endpoint-routing", () => {
  it("extracts controller prefix without query/hash fragments", () => {
    expect(
      extractControllerPrefix("/api/v1/reservations?status=upcoming&limit=10"),
    ).toBe("reservations");

    expect(
      extractControllerPrefix("user-reports?userId=abc123#section"),
    ).toBe("user-reports");
  });

  it("resolves direct service key for endpoints with query params", () => {
    expect(
      resolveDirectServiceKey("/api/v1/reservations?status=upcoming&limit=10"),
    ).toBe("availability");

    expect(resolveDirectServiceKey("user-reports?userId=abc123")).toBe(
      "reports",
    );
  });
});
