import type { Meta, StoryObj } from "@storybook/react";
import { QuickStats } from "./QuickStats";

const meta: Meta<typeof QuickStats> = {
  title: "Analytics/QuickStats",
  component: QuickStats,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof QuickStats>;

export const Default: Story = {
  args: {
    stats: [
      { label: "Reservas Hoy", value: "12" },
      { label: "Pendientes", value: "5" },
      { label: "Ocupación", value: "78%" },
    ],
  },
};
