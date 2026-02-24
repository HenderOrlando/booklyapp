import type { Meta, StoryObj } from "@storybook/react";
import { TimelinePoint } from "./TimelinePoint";

const meta: Meta<typeof TimelinePoint> = {
  title: "Atoms/TimelinePoint",
  component: TimelinePoint,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["completed", "current", "pending", "rejected"],
    },
    pulse: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof TimelinePoint>;

export const Completed: Story = {
  args: { status: "completed" },
};

export const Current: Story = {
  args: { status: "current", pulse: true },
};

export const Pending: Story = {
  args: { status: "pending" },
};

export const Rejected: Story = {
  args: { status: "rejected" },
};

export const Timeline: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4">
      <TimelinePoint status="completed" />
      <div className="h-0.5 w-12 bg-green-500" />
      <TimelinePoint status="completed" />
      <div className="h-0.5 w-12 bg-blue-500" />
      <TimelinePoint status="current" pulse />
      <div className="h-0.5 w-12 bg-gray-300" />
      <TimelinePoint status="pending" />
    </div>
  ),
};
