import type { Meta, StoryObj } from "@storybook/react";
import { MetricCard } from "./MetricCard";

const meta: Meta<typeof MetricCard> = {
  title: "Analytics/MetricCard",
  component: MetricCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MetricCard>;

export const Default: Story = {
  args: {
    title: "Total Reservas",
    value: 1234,
    trend: { value: 12.5, isPositive: true, label: "vs mes anterior" },
    color: "blue",
  },
};

export const TrendDown: Story = {
  args: {
    title: "Cancelaciones",
    value: 45,
    trend: { value: 8.3, isPositive: false, label: "vs mes anterior" },
    color: "red",
  },
};

export const Loading: Story = {
  args: {
    title: "Recursos Activos",
    value: 87,
    loading: true,
  },
};
