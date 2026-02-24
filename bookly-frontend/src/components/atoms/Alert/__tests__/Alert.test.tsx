import { render, screen } from "@testing-library/react";
import { Alert, AlertDescription, AlertTitle } from "../Alert";

describe("Alert", () => {
  it("renders alert with title and description", () => {
    render(
      <Alert>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Something happened</AlertDescription>
      </Alert>,
    );
    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("Something happened")).toBeInTheDocument();
  });

  it("renders with default variant", () => {
    render(
      <Alert data-testid="alert">
        <AlertDescription>Info</AlertDescription>
      </Alert>,
    );
    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });

  it("renders with error variant", () => {
    render(
      <Alert variant="error" data-testid="alert">
        <AlertDescription>Error occurred</AlertDescription>
      </Alert>,
    );
    const alert = screen.getByTestId("alert");
    expect(alert.className).toContain("color-state-error");
  });

  it("applies custom className", () => {
    render(
      <Alert className="my-alert" data-testid="alert">
        <AlertDescription>Custom</AlertDescription>
      </Alert>,
    );
    expect(screen.getByTestId("alert").className).toContain("my-alert");
  });

  it("has role=alert for accessibility", () => {
    render(
      <Alert>
        <AlertDescription>Accessible alert</AlertDescription>
      </Alert>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
