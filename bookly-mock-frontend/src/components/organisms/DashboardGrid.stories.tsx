import type { Meta, StoryObj } from "@storybook/react";
import { DashboardGrid } from "./DashboardGrid";

const meta: Meta<typeof DashboardGrid> = {
  title: "Organisms/DashboardGrid",
  component: DashboardGrid,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DashboardGrid>;

export const Default: Story = {
  render: () => <DashboardGrid />,
};
