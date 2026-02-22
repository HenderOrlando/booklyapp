import type { Meta, StoryObj } from "@storybook/react";
import { AvailabilityIndicator } from "./AvailabilityIndicator";

const meta: Meta<typeof AvailabilityIndicator> = {
  title: "Atoms/AvailabilityIndicator",
  component: AvailabilityIndicator,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["available", "occupied", "partial", "unavailable"],
      description: "Estado de disponibilidad",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    showLabel: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof AvailabilityIndicator>;

export const Available: Story = {
  args: { status: "available", showLabel: true },
};

export const Occupied: Story = {
  args: { status: "occupied", showLabel: true },
};

export const Partial: Story = {
  args: { status: "partial", showLabel: true },
};

export const Unavailable: Story = {
  args: { status: "unavailable", showLabel: true },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <AvailabilityIndicator status="available" showLabel size="lg" />
      <AvailabilityIndicator status="occupied" showLabel size="lg" />
      <AvailabilityIndicator status="partial" showLabel size="lg" />
      <AvailabilityIndicator status="unavailable" showLabel size="lg" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4">
      <AvailabilityIndicator status="available" size="sm" showLabel />
      <AvailabilityIndicator status="available" size="md" showLabel />
      <AvailabilityIndicator status="available" size="lg" showLabel />
    </div>
  ),
};
