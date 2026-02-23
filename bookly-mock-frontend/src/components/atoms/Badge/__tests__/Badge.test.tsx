import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders with text content", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders default variant", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge.className).toContain("bg-app");
  });

  it("renders success variant with state tokens", () => {
    render(<Badge variant="success">Confirmed</Badge>);
    const badge = screen.getByText("Confirmed");
    expect(badge.className).toContain("border-state-success-border");
  });

  it("renders warning variant with state tokens", () => {
    render(<Badge variant="warning">Pending</Badge>);
    const badge = screen.getByText("Pending");
    expect(badge.className).toContain("border-state-warning-border");
  });

  it("renders error variant with state tokens", () => {
    render(<Badge variant="error">Rejected</Badge>);
    const badge = screen.getByText("Rejected");
    expect(badge.className).toContain("border-state-error-border");
  });

  it("renders primary variant with brand colors", () => {
    render(<Badge variant="primary">Primary</Badge>);
    const badge = screen.getByText("Primary");
    expect(badge.className).toContain("bg-action-primary");
  });

  it("renders secondary variant with brand colors", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText("Secondary");
    expect(badge.className).toContain("bg-action-secondary");
  });

  it("renders outline variant with border", () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText("Outline");
    expect(badge.className).toContain("border");
  });

  it("applies custom className", () => {
    render(<Badge className="my-class">Custom</Badge>);
    expect(screen.getByText("Custom").className).toContain("my-class");
  });

  it("has correct base styles (rounded, text-xs, font-semibold)", () => {
    render(<Badge>Styled</Badge>);
    const badge = screen.getByText("Styled");
    expect(badge.className).toContain("rounded-md");
    expect(badge.className).toContain("text-xs");
    expect(badge.className).toContain("font-semibold");
  });
});
