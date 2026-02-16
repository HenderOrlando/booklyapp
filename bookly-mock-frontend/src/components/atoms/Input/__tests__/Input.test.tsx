import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../Input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText("Type here");
    await user.type(input, "Hello World");
    expect(input).toHaveValue("Hello World");
  });

  it("renders with correct type", () => {
    render(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText("Email")).toHaveAttribute("type", "email");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText("Disabled")).toBeDisabled();
  });

  it("shows error message when error prop is provided", () => {
    render(<Input error="Campo requerido" placeholder="Name" />);
    expect(screen.getByText("Campo requerido")).toBeInTheDocument();
  });

  it("applies error border style when error exists", () => {
    render(<Input error="Error" placeholder="Name" />);
    const input = screen.getByPlaceholderText("Name");
    expect(input.className).toContain("border-destructive");
  });

  it("does not show error when error is undefined", () => {
    render(<Input placeholder="Name" />);
    expect(screen.queryByText("Campo requerido")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Input className="custom-input" placeholder="Custom" />);
    expect(screen.getByPlaceholderText("Custom").className).toContain("custom-input");
  });

  it("has focus-visible ring for accessibility", () => {
    render(<Input placeholder="Focus" />);
    const input = screen.getByPlaceholderText("Focus");
    expect(input.className).toContain("focus-visible:ring-2");
  });

  it("forwards ref correctly", () => {
    const ref = jest.fn();
    render(<Input ref={ref} placeholder="Ref" />);
    expect(ref).toHaveBeenCalled();
  });
});
