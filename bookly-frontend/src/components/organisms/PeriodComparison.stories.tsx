import type { Meta, StoryObj } from "@storybook/react";
import { PeriodComparison } from "./PeriodComparison";

const meta: Meta<typeof PeriodComparison> = {
  title: "Organisms/PeriodComparison",
  component: PeriodComparison,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PeriodComparison>;

export const Default: Story = {
  render: () => (
    <PeriodComparison
      period1={{
        label: "Este mes",
        data: [{ name: "Sem 1", value: 40 }, { name: "Sem 2", value: 55 }, { name: "Sem 3", value: 35 }, { name: "Sem 4", value: 60 }],
        stats: { total: 190, average: 47.5, peak: 60 },
      }}
      period2={{
        label: "Mes anterior",
        data: [{ name: "Sem 1", value: 30 }, { name: "Sem 2", value: 45 }, { name: "Sem 3", value: 28 }, { name: "Sem 4", value: 50 }],
        stats: { total: 153, average: 38.25, peak: 50 },
      }}
      metric="Reservas"
    />
  ),
};
