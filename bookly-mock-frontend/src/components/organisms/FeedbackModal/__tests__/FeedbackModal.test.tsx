import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeedbackModal } from "../FeedbackModal";

// Mock @radix-ui/react-dialog to render inline for testing
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

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  reservationId: "res-001",
  resourceName: "Sala A101",
  onSubmit: jest.fn().mockResolvedValue(undefined),
};

describe("FeedbackModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title and resource name", () => {
    render(<FeedbackModal {...defaultProps} />);
    expect(screen.getByText("Califica tu experiencia")).toBeInTheDocument();
    expect(screen.getByText(/Sala A101/)).toBeInTheDocument();
  });

  it("renders 5 star buttons", () => {
    render(<FeedbackModal {...defaultProps} />);
    const starButtons = screen.getAllByRole("button", { name: /estrellas/ });
    expect(starButtons).toHaveLength(5);
  });

  it("renders feedback categories", () => {
    render(<FeedbackModal {...defaultProps} />);
    expect(screen.getByText("Limpieza")).toBeInTheDocument();
    expect(screen.getByText("Equipamiento")).toBeInTheDocument();
    expect(screen.getByText("Iluminación")).toBeInTheDocument();
  });

  it("disables submit when no rating", () => {
    render(<FeedbackModal {...defaultProps} />);
    const submitBtn = screen.getByRole("button", { name: /enviar feedback/i });
    expect(submitBtn).toBeDisabled();
  });

  it("enables submit after rating", async () => {
    const user = userEvent.setup();
    render(<FeedbackModal {...defaultProps} />);
    await user.click(screen.getByLabelText("4 estrellas"));
    const submitBtn = screen.getByRole("button", { name: /enviar feedback/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it("calls onSubmit with correct data", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<FeedbackModal {...defaultProps} onSubmit={onSubmit} />);

    await user.click(screen.getByLabelText("5 estrellas"));
    await user.click(screen.getByText("Limpieza"));
    await user.type(
      screen.getByPlaceholderText(/cuéntanos/i),
      "Excelente experiencia"
    );
    await user.click(screen.getByRole("button", { name: /enviar feedback/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      reservationId: "res-001",
      rating: 5,
      comment: "Excelente experiencia",
      categories: ["Limpieza"],
    });
  });

  it("shows success state after submit", async () => {
    const user = userEvent.setup();
    render(<FeedbackModal {...defaultProps} />);
    await user.click(screen.getByLabelText("3 estrellas"));
    await user.click(screen.getByRole("button", { name: /enviar feedback/i }));
    expect(
      await screen.findByText(/gracias por tu feedback/i)
    ).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<FeedbackModal {...defaultProps} open={false} />);
    expect(
      screen.queryByText("Califica tu experiencia")
    ).not.toBeInTheDocument();
  });

  it("toggles category on click", async () => {
    const user = userEvent.setup();
    render(<FeedbackModal {...defaultProps} />);
    const limpiezaBtn = screen.getByText("Limpieza");
    await user.click(limpiezaBtn);
    expect(limpiezaBtn.className).toContain("bg-brand-primary-500");
    await user.click(limpiezaBtn);
    expect(limpiezaBtn.className).not.toContain("bg-brand-primary-500");
  });
});
