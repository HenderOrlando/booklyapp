import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DynamicAttributeEditor } from "../DynamicAttributeEditor";

const mockAttributes: Record<string, any> = {
  capacidad_max: 50,
  tiene_proyector: true,
  notas: "Sala con vista",
};

describe("DynamicAttributeEditor", () => {
  it("renders existing attributes", () => {
    render(
      <DynamicAttributeEditor
        attributes={mockAttributes}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByDisplayValue("capacidad_max")).toBeInTheDocument();
    expect(screen.getByDisplayValue("50")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Sala con vista")).toBeInTheDocument();
  });

  it("renders add button", () => {
    render(<DynamicAttributeEditor attributes={{}} onChange={jest.fn()} />);
    expect(
      screen.getByRole("button", { name: /agregar/i }),
    ).toBeInTheDocument();
  });

  it("shows empty state message when no attributes", () => {
    render(<DynamicAttributeEditor attributes={{}} onChange={jest.fn()} />);
    expect(screen.getByText(/sin atributos definidos/i)).toBeInTheDocument();
  });

  it("renders title", () => {
    render(
      <DynamicAttributeEditor
        attributes={mockAttributes}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByText(/atributos del recurso/i)).toBeInTheDocument();
  });

  it("renders delete buttons for each attribute", () => {
    render(
      <DynamicAttributeEditor
        attributes={mockAttributes}
        onChange={jest.fn()}
      />,
    );
    const deleteButtons = screen.getAllByLabelText(/eliminar atributo/i);
    expect(deleteButtons).toHaveLength(3);
  });

  it("calls onChange when removing an attribute", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <DynamicAttributeEditor
        attributes={mockAttributes}
        onChange={onChange}
      />,
    );
    const deleteButtons = screen.getAllByLabelText(/eliminar atributo/i);
    await user.click(deleteButtons[0]);
    expect(onChange).toHaveBeenCalled();
    // After removing capacidad_max, remaining should be tiene_proyector and notas
    const callArg = onChange.mock.calls[0][0];
    expect(callArg).not.toHaveProperty("capacidad_max");
    expect(callArg).toHaveProperty("notas");
  });

  it("renders boolean toggle for boolean attributes", () => {
    render(
      <DynamicAttributeEditor
        attributes={{ active: true }}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });
});
