import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { EmptyState } from "./EmptyState";

const meta: Meta<typeof EmptyState> = {
  title: "Atoms/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: "No hay recursos",
    description: "No se encontraron recursos que coincidan con tu búsqueda.",
  },
};

export const WithAction: Story = {
  args: {
    title: "Sin reservas",
    description: "Aún no tienes reservas. Crea tu primera reserva ahora.",
    action: <Button>Crear Reserva</Button>,
  },
};

export const CustomIcon: Story = {
  args: {
    icon: "📅",
    title: "Calendario vacío",
    description: "No hay eventos programados para este período.",
  },
};

export const NoResults: Story = {
  args: {
    icon: "🔍",
    title: "Sin resultados",
    description: "Intenta ajustar los filtros de búsqueda.",
    action: <Button variant="outline">Limpiar filtros</Button>,
  },
};
