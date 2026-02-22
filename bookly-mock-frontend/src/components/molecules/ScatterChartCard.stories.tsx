import type { Meta, StoryObj } from "@storybook/react";
import { ScatterChartCard } from "./ScatterChartCard";

const meta: Meta<typeof ScatterChartCard> = {
  title: "Molecules/Charts/ScatterChartCard",
  component: ScatterChartCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ScatterChartCard>;

export const Default: Story = {
  args: {
    title: "Uso vs Capacidad",
    data: [
      { x: 20, y: 15 },
      { x: 30, y: 28 },
      { x: 40, y: 35 },
      { x: 50, y: 42 },
      { x: 60, y: 55 },
    ],
    xKey: "x",
    yKey: "y",
  },
};
