import type { Meta, StoryObj } from "@storybook/react";
import { BarChartCard } from "./BarChartCard";

const meta: Meta<typeof BarChartCard> = {
  title: "Molecules/Charts/BarChartCard",
  component: BarChartCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BarChartCard>;

export const Default: Story = {
  args: {
    title: "Reservas por Categoría",
    data: [
      { name: "Salas", value: 45 },
      { name: "Laboratorios", value: 32 },
      { name: "Auditorios", value: 18 },
      { name: "Equipos", value: 25 },
    ],
    yKey: "value",
    xKey: "name",
  },
};
