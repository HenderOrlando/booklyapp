import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../Badge";

const meta: Meta<typeof Badge> = {
  title: "Atoms/StatusBadge",
  component: Badge,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const ResourceStatuses: Story = {
  name: "Estados de Recursos",
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      <Badge variant="success">Disponible</Badge>
      <Badge variant="secondary">Reservado</Badge>
      <Badge variant="warning">En mantenimiento</Badge>
      <Badge variant="error">No disponible</Badge>
    </div>
  ),
};

export const ApprovalStatuses: Story = {
  name: "Estados de Aprobación",
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      <Badge variant="warning">Pendiente</Badge>
      <Badge variant="success">Aprobado</Badge>
      <Badge variant="error">Rechazado</Badge>
    </div>
  ),
};

export const ReservationStatuses: Story = {
  name: "Estados de Reserva",
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      <Badge variant="warning">Pendiente</Badge>
      <Badge variant="success">Confirmada</Badge>
      <Badge variant="success">Aprobada</Badge>
      <Badge variant="error">Rechazada</Badge>
      <Badge variant="default">Check-in</Badge>
      <Badge variant="default">Activa</Badge>
      <Badge variant="success">Completada</Badge>
      <Badge variant="secondary">Cancelada</Badge>
    </div>
  ),
};

export const MaintenanceStatuses: Story = {
  name: "Estados de Mantenimiento",
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      <Badge variant="secondary">Programado</Badge>
      <Badge variant="warning">En progreso</Badge>
      <Badge variant="success">Completado</Badge>
      <Badge variant="error">Cancelado</Badge>
    </div>
  ),
};
