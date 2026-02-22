import type { Meta, StoryObj } from "@storybook/react";
import { TrendChart } from "./TrendChart";

const meta: Meta<typeof TrendChart> = {
  title: "Analytics/TrendChart",
  component: TrendChart,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TrendChart>;

export const Default: Story = {
  args: {
    data: [
      { label: "Ene", value: 120 },
      { label: "Feb", value: 180 },
      { label: "Mar", value: 150 },
      { label: "Abr", value: 220 },
      { label: "May", value: 190 },
      { label: "Jun", value: 280 },
    ],
    title: "Tendencia de Reservas",
  },
};
