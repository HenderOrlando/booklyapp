import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReminderConfigModal } from "../ReminderConfigModal";

jest.mock("@radix-ui/react-dialog", () => ({
  Root: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  Portal: ({ children }: any) => <div>{children}</div>,
  Overlay: ({ className }: any) => <div className={className} />,
  Content: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  Title: ({ children, className }: any) => (
    <h2 className={className}>{children}</h2>
  ),
  Description: ({ children, className }: any) => (
    <p className={className}>{children}</p>
  ),
  Close: ({ children }: any) => <>{children}</>,
}));

const mockReminders = [
  { id: "rem-1", minutesBefore: 30, channel: "email" as const, enabled: true },
  {
    id: "rem-2",
    minutesBefore: 60,
    channel: "push" as const,
    enabled: false,
  },
];

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  reminders: mockReminders,
  onSave: jest.fn().mockResolvedValue(undefined),
};

describe("ReminderConfigModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title", () => {
    render(<ReminderConfigModal {...defaultProps} />);
    expect(screen.getByText("Configurar Recordatorios")).toBeInTheDocument();
  });

  it("renders existing reminders", () => {
    render(<ReminderConfigModal {...defaultProps} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
  });

  it("renders add button", () => {
    render(<ReminderConfigModal {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /agregar recordatorio/i })
    ).toBeInTheDocument();
  });

  it("shows empty state when no reminders", () => {
    render(<ReminderConfigModal {...defaultProps} reminders={[]} />);
    expect(
      screen.getByText("No hay recordatorios configurados")
    ).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<ReminderConfigModal {...defaultProps} open={false} />);
    expect(
      screen.queryByText("Configurar Recordatorios")
    ).not.toBeInTheDocument();
  });

  it("renders save and cancel buttons", () => {
    render(<ReminderConfigModal {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /guardar/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cancelar/i })
    ).toBeInTheDocument();
  });

  it("renders delete buttons for each reminder", () => {
    render(<ReminderConfigModal {...defaultProps} />);
    const deleteButtons = screen.getAllByLabelText("Eliminar recordatorio");
    expect(deleteButtons).toHaveLength(2);
  });

  it("calls onSave when save button is clicked", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<ReminderConfigModal {...defaultProps} onSave={onSave} />);
    await user.click(screen.getByRole("button", { name: /guardar/i }));
    expect(onSave).toHaveBeenCalledWith(mockReminders);
  });

  it("calls onOpenChange when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    render(
      <ReminderConfigModal {...defaultProps} onOpenChange={onOpenChange} />
    );
    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
