import type { Meta, StoryObj } from "@storybook/react";
import { StatsSummary } from "./StatsSummary";

const meta: Meta<typeof StatsSummary> = {
  title: "Analytics/StatsSummary",
  component: StatsSummary,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StatsSummary>;

export const Default: Story = {
  args: {
    title: "Resumen del Período",
    stats: [
      { label: "Total Reservas", value: 1500, previousValue: 1200 },
      { label: "Ocupación", value: 78, previousValue: 72, format: "percentage" },
      { label: "Cancelaciones", value: 45, previousValue: 60 },
      { label: "Horas de Uso", value: 320, previousValue: 280, format: "duration" },
    ],
  },
};
