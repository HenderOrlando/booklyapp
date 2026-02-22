import type { Meta, StoryObj } from "@storybook/react";
import { AreaChartCard } from "./AreaChartCard";

const meta: Meta<typeof AreaChartCard> = {
  title: "Molecules/Charts/AreaChartCard",
  component: AreaChartCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AreaChartCard>;

export const Default: Story = {
  args: {
    title: "Uso por Mes",
    data: [
      { name: "Ene", value: 120 },
      { name: "Feb", value: 180 },
      { name: "Mar", value: 150 },
      { name: "Abr", value: 220 },
      { name: "May", value: 190 },
      { name: "Jun", value: 280 },
    ],
    yKey: "value",
    xKey: "name",
  },
};
