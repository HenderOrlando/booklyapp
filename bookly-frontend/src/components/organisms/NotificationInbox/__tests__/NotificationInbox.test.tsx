import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationInbox, Notification } from "../NotificationInbox";

const mockNotifications: Notification[] = [
  {
    id: "n-1",
    title: "Reserva confirmada",
    message: "Tu reserva de Sala A101 fue aprobada",
    type: "success",
    read: false,
    createdAt: "2026-02-16T10:00:00Z",
  },
  {
    id: "n-2",
    title: "Mantenimiento programado",
    message: "Lab Cómputo 1 estará en mantenimiento mañana",
    type: "warning",
    read: true,
    createdAt: "2026-02-15T09:00:00Z",
  },
  {
    id: "n-3",
    title: "Reserva cancelada",
    message: "Tu reserva fue cancelada por conflicto de horario",
    type: "error",
    read: false,
    createdAt: "2026-02-14T14:00:00Z",
  },
];

const defaultProps = {
  notifications: mockNotifications,
  onMarkAsRead: jest.fn(),
  onMarkAllAsRead: jest.fn(),
  onDelete: jest.fn(),
  onNotificationClick: jest.fn(),
};

describe("NotificationInbox", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all notifications", () => {
    render(<NotificationInbox {...defaultProps} />);
    expect(screen.getByText("Reserva confirmada")).toBeInTheDocument();
    expect(screen.getByText("Mantenimiento programado")).toBeInTheDocument();
    expect(screen.getByText("Reserva cancelada")).toBeInTheDocument();
  });

  it("shows unread count badge", () => {
    render(<NotificationInbox {...defaultProps} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows empty state when no notifications", () => {
    render(
      <NotificationInbox {...defaultProps} notifications={[]} />
    );
    expect(screen.getByText("Sin notificaciones")).toBeInTheDocument();
  });

  it("calls onMarkAsRead when clicking mark as read button", async () => {
    const user = userEvent.setup();
    render(<NotificationInbox {...defaultProps} />);
    const markButtons = screen.getAllByLabelText("Marcar como leída");
    await user.click(markButtons[0]);
    expect(defaultProps.onMarkAsRead).toHaveBeenCalledWith("n-1");
  });

  it("calls onMarkAllAsRead when clicking mark all", async () => {
    const user = userEvent.setup();
    render(<NotificationInbox {...defaultProps} />);
    await user.click(screen.getByText("Marcar todas"));
    expect(defaultProps.onMarkAllAsRead).toHaveBeenCalledTimes(1);
  });

  it("calls onDelete when clicking delete button", async () => {
    const user = userEvent.setup();
    render(<NotificationInbox {...defaultProps} />);
    const deleteButtons = screen.getAllByLabelText("Eliminar notificación");
    await user.click(deleteButtons[0]);
    expect(defaultProps.onDelete).toHaveBeenCalledWith("n-1");
  });

  it("calls onNotificationClick when clicking a notification", async () => {
    const user = userEvent.setup();
    render(<NotificationInbox {...defaultProps} />);
    await user.click(screen.getByText("Reserva confirmada"));
    expect(defaultProps.onNotificationClick).toHaveBeenCalledWith(
      mockNotifications[0]
    );
  });

  it("does not show mark-all button when all are read", () => {
    const allRead = mockNotifications.map((n) => ({ ...n, read: true }));
    render(
      <NotificationInbox {...defaultProps} notifications={allRead} />
    );
    expect(screen.queryByText("Marcar todas")).not.toBeInTheDocument();
  });

  it("applies unread styling to unread notifications", () => {
    render(<NotificationInbox {...defaultProps} />);
    const title = screen.getByText("Reserva confirmada");
    expect(title.className).toContain("font-semibold");
  });
});
