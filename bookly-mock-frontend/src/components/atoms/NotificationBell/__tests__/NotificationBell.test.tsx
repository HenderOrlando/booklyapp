import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationBell } from "../NotificationBell";

describe("NotificationBell", () => {
  it("renders bell icon", () => {
    render(<NotificationBell count={0} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows no badge when count is 0", () => {
    render(<NotificationBell count={0} />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Notificaciones"
    );
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows badge with count when count > 0", () => {
    render(<NotificationBell count={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows 99+ when count > 99", () => {
    render(<NotificationBell count={150} />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("includes unread count in aria-label", () => {
    render(<NotificationBell count={3} />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Notificaciones (3 sin leer)"
    );
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<NotificationBell count={2} onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    render(<NotificationBell count={0} className="my-bell" />);
    expect(screen.getByRole("button").className).toContain("my-bell");
  });
});
