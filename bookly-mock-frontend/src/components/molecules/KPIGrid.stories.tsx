import type { Meta, StoryObj } from "@storybook/react";
import { KPIGrid } from "./KPIGrid";

const meta: Meta<typeof KPIGrid> = {
  title: "Molecules/KPIGrid",
  component: KPIGrid,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof KPIGrid>;

export const Default: Story = {
  args: {
    kpis: {
      totalReservations: 1234,
      activeUsers: 523,
      totalResources: 87,
      averageOccupancy: 78,
      satisfactionRate: 92,
      cancelRate: 5,
      noShowRate: 3,
      period: "MONTH",
      comparedToPrevious: {
        reservations: 12.5,
        users: 5.2,
        occupancy: -2.1,
      },
    },
  },
};

export const Loading: Story = {
  args: { loading: true },
};
