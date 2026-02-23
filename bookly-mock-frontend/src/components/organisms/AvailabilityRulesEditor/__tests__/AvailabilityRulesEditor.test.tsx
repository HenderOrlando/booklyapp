import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AvailabilityRulesEditor } from "../AvailabilityRulesEditor";

const defaultRules = {
  requiresApproval: false,
  maxAdvanceBookingDays: 30,
  minBookingDurationMinutes: 60,
  maxBookingDurationMinutes: 240,
  bufferTimeBetweenReservationsMinutes: 15,
  allowRecurring: true,
};

describe("AvailabilityRulesEditor", () => {
  it("renders title", () => {
    render(
      <AvailabilityRulesEditor value={defaultRules} onChange={jest.fn()} />
    );
    expect(screen.getByText("Reglas de Disponibilidad")).toBeInTheDocument();
  });

  it("renders all rule fields", () => {
    render(
      <AvailabilityRulesEditor value={defaultRules} onChange={jest.fn()} />
    );
    expect(screen.getByText("Requiere aprobación")).toBeInTheDocument();
    expect(screen.getByText("Días máx. de anticipación")).toBeInTheDocument();
    expect(screen.getByText("Duración mínima (min)")).toBeInTheDocument();
    expect(screen.getByText("Duración máxima (min)")).toBeInTheDocument();
    expect(screen.getByText("Buffer entre reservas (min)")).toBeInTheDocument();
    expect(
      screen.getByText("Permitir reservas recurrentes")
    ).toBeInTheDocument();
  });

  it("renders current values", () => {
    render(
      <AvailabilityRulesEditor value={defaultRules} onChange={jest.fn()} />
    );
    expect(screen.getByDisplayValue("30")).toBeInTheDocument();
    expect(screen.getByDisplayValue("60")).toBeInTheDocument();
    expect(screen.getByDisplayValue("240")).toBeInTheDocument();
    expect(screen.getByDisplayValue("15")).toBeInTheDocument();
  });

  it("calls onChange when toggling requiresApproval", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <AvailabilityRulesEditor value={defaultRules} onChange={onChange} />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);
    expect(onChange).toHaveBeenCalledWith({
      ...defaultRules,
      requiresApproval: true,
    });
  });

  it("calls onChange when toggling allowRecurring", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <AvailabilityRulesEditor value={defaultRules} onChange={onChange} />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]);
    expect(onChange).toHaveBeenCalledWith({
      ...defaultRules,
      allowRecurring: false,
    });
  });

  it("renders switches with correct aria-checked state", () => {
    render(
      <AvailabilityRulesEditor value={defaultRules} onChange={jest.fn()} />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toHaveAttribute("data-state", "unchecked");
    expect(checkboxes[1]).toHaveAttribute("data-state", "checked");
  });
});
