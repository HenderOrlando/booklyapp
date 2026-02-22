import type { Meta, StoryObj } from "@storybook/react";
import { LineChartCard } from "./LineChartCard";

const meta: Meta<typeof LineChartCard> = {
  title: "Molecules/Charts/LineChartCard",
  component: LineChartCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LineChartCard>;

export const Default: Story = {
  args: {
    title: "Tendencia de Reservas",
    data: [
      { name: "Ene", value: 65 },
      { name: "Feb", value: 80 },
      { name: "Mar", value: 72 },
      { name: "Abr", value: 95 },
      { name: "May", value: 88 },
      { name: "Jun", value: 110 },
    ],
    xKey: "name",
    yKey: "value",
  },
};
