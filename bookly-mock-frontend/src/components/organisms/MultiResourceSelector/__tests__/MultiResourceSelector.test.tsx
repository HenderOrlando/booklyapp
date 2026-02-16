import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultiResourceSelector } from "../MultiResourceSelector";

const mockResources = [
  { id: "r1", name: "Sala A101", type: "CLASSROOM", location: "Edificio A", capacity: 30, isAvailable: true },
  { id: "r2", name: "Lab Cómputo 1", type: "LAB", location: "Edificio B", capacity: 25, isAvailable: true },
  { id: "r3", name: "Auditorio", type: "AUDITORIUM", location: "Edificio C", capacity: 200, isAvailable: true },
  { id: "r4", name: "Sala Ocupada", type: "CLASSROOM", location: "Edificio A", capacity: 20, isAvailable: false },
];

describe("MultiResourceSelector", () => {
  it("renders empty state when no resources selected", () => {
    render(
      <MultiResourceSelector
        selectedIds={[]}
        onChange={jest.fn()}
        resources={mockResources}
      />
    );
    expect(screen.getByText(/selecciona al menos un recurso/i)).toBeInTheDocument();
  });

  it("shows selected resources count", () => {
    render(
      <MultiResourceSelector
        selectedIds={["r1"]}
        onChange={jest.fn()}
        resources={mockResources}
      />
    );
    expect(screen.getByText(/1\/5/)).toBeInTheDocument();
  });

  it("renders selected resources with names", () => {
    render(
      <MultiResourceSelector
        selectedIds={["r1", "r2"]}
        onChange={jest.fn()}
        resources={mockResources}
      />
    );
    expect(screen.getByText("Sala A101")).toBeInTheDocument();
    expect(screen.getByText("Lab Cómputo 1")).toBeInTheDocument();
  });

  it("calls onChange when removing a resource", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <MultiResourceSelector
        selectedIds={["r1", "r2"]}
        onChange={onChange}
        resources={mockResources}
      />
    );
    const removeButtons = screen.getAllByLabelText(/remover/i);
    await user.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith(["r2"]);
  });

  it("opens resource picker when clicking add button", async () => {
    const user = userEvent.setup();
    render(
      <MultiResourceSelector
        selectedIds={[]}
        onChange={jest.fn()}
        resources={mockResources}
      />
    );
    await user.click(screen.getByText(/agregar recurso/i));
    expect(screen.getByPlaceholderText(/buscar recurso/i)).toBeInTheDocument();
  });

  it("hides add button when maxResources reached", () => {
    render(
      <MultiResourceSelector
        selectedIds={["r1", "r2"]}
        onChange={jest.fn()}
        resources={mockResources}
        maxResources={2}
      />
    );
    expect(screen.queryByText(/agregar recurso/i)).not.toBeInTheDocument();
  });

  it("does not show unavailable resources in picker", async () => {
    const user = userEvent.setup();
    render(
      <MultiResourceSelector
        selectedIds={[]}
        onChange={jest.fn()}
        resources={mockResources}
      />
    );
    await user.click(screen.getByText(/agregar recurso/i));
    expect(screen.queryByText("Sala Ocupada")).not.toBeInTheDocument();
  });

  it("filters resources by search term", async () => {
    const user = userEvent.setup();
    render(
      <MultiResourceSelector
        selectedIds={[]}
        onChange={jest.fn()}
        resources={mockResources}
      />
    );
    await user.click(screen.getByText(/agregar recurso/i));
    await user.type(screen.getByPlaceholderText(/buscar recurso/i), "Auditorio");
    expect(screen.getByText("Auditorio")).toBeInTheDocument();
    expect(screen.queryByText("Sala A101")).not.toBeInTheDocument();
  });
});
