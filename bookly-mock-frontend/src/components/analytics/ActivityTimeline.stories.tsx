import type { Meta, StoryObj } from "@storybook/react";
import { ActivityTimeline } from "./ActivityTimeline";

const meta: Meta<typeof ActivityTimeline> = {
  title: "Analytics/ActivityTimeline",
  component: ActivityTimeline,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ActivityTimeline>;

export const Default: Story = {
  render: () => (
    <ActivityTimeline
      activities={[
        { id: "1", title: "Reserva creada", description: "Sala A - Juan Pérez", timestamp: "Hace 5 min", type: "success" },
        { id: "2", title: "Reserva aprobada", description: "Lab Redes - Admin", timestamp: "Hace 15 min", type: "info" },
        { id: "3", title: "Check-in", description: "Auditorio - María García", timestamp: "Hace 30 min", type: "warning" },
        { id: "4", title: "Cancelación", description: "Sala B - Carlos López", timestamp: "Hace 1h", type: "error" },
      ]}
    />
  ),
};
