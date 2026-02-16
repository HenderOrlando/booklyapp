import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImportResourcesModal } from "../ImportResourcesModal";

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
  onImport: jest.fn().mockResolvedValue({
    successCount: 5,
    updatedCount: 2,
    errorCount: 0,
    errors: [],
  }),
};

describe("ImportResourcesModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title", () => {
    render(<ImportResourcesModal {...defaultProps} />);
    expect(
      screen.getByText("Importar Recursos desde CSV")
    ).toBeInTheDocument();
  });

  it("renders file upload area", () => {
    render(<ImportResourcesModal {...defaultProps} />);
    expect(screen.getByText("Seleccionar archivo CSV")).toBeInTheDocument();
  });

  it("renders mode selection buttons", () => {
    render(<ImportResourcesModal {...defaultProps} />);
    expect(screen.getByText("Crear")).toBeInTheDocument();
    expect(screen.getByText("Actualizar")).toBeInTheDocument();
    expect(screen.getByText("Crear/Actualizar")).toBeInTheDocument();
  });

  it("renders skip errors checkbox", () => {
    render(<ImportResourcesModal {...defaultProps} />);
    expect(
      screen.getByText(/continuar importación si hay errores/i)
    ).toBeInTheDocument();
  });

  it("disables import button when no file selected", () => {
    render(<ImportResourcesModal {...defaultProps} />);
    const importBtn = screen.getByRole("button", { name: /importar$/i });
    expect(importBtn).toBeDisabled();
  });

  it("does not render when closed", () => {
    render(<ImportResourcesModal {...defaultProps} open={false} />);
    expect(
      screen.queryByText("Importar Recursos desde CSV")
    ).not.toBeInTheDocument();
  });

  it("renders cancel and import buttons", () => {
    render(<ImportResourcesModal {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /cancelar/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /importar$/i })
    ).toBeInTheDocument();
  });

  it("renders mode description", () => {
    render(<ImportResourcesModal {...defaultProps} />);
    expect(screen.getByText("Modo de importación")).toBeInTheDocument();
  });
});
