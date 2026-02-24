import type { Meta, StoryObj } from "@storybook/react";
import { ChartTooltip } from "./ChartTooltip";

const meta: Meta<typeof ChartTooltip> = {
  title: "Atoms/ChartTooltip",
  component: ChartTooltip,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChartTooltip>;

export const Active: Story = {
  args: {
    active: true,
    label: "Enero 2025",
    payload: [
      { name: "Reservas", value: 45, color: "#2563EB" },
      { name: "Cancelaciones", value: 5, color: "#EF4444" },
    ],
  },
};

export const WithFormatter: Story = {
  args: {
    active: true,
    label: "Febrero 2025",
    payload: [
      { name: "Horas de uso", value: 120, color: "#14B8A6" },
    ],
    formatter: (value: number) => `${value} hrs`,
  },
};

export const Inactive: Story = {
  args: {
    active: false,
    payload: [],
  },
};
