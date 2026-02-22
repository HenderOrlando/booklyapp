import type { Meta, StoryObj } from "@storybook/react";
import { PieChartCard } from "./PieChartCard";

const meta: Meta<typeof PieChartCard> = {
  title: "Molecules/Charts/PieChartCard",
  component: PieChartCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PieChartCard>;

export const Default: Story = {
  args: {
    title: "Distribución por Categoría",
    data: [
      { name: "Salas", value: 45 },
      { name: "Laboratorios", value: 32 },
      { name: "Auditorios", value: 18 },
      { name: "Equipos", value: 25 },
    ],
    nameKey: "name",
    valueKey: "value",
  },
};
