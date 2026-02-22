import type { Meta, StoryObj } from "@storybook/react";
import { DurationBadge } from "./DurationBadge";

const meta: Meta<typeof DurationBadge> = {
  title: "Atoms/DurationBadge",
  component: DurationBadge,
  tags: ["autodocs"],
  argTypes: {
    minutes: { control: "number" },
    showIcon: { control: "boolean" },
    variant: {
      control: "select",
      options: ["default", "success", "warning", "error", "secondary"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DurationBadge>;

export const ThirtyMinutes: Story = {
  args: { minutes: 30 },
};

export const OneHour: Story = {
  args: { minutes: 60 },
};

export const NinetyMinutes: Story = {
  args: { minutes: 90 },
};

export const TwoHours: Story = {
  args: { minutes: 120 },
};

export const NoIcon: Story = {
  args: { minutes: 45, showIcon: false },
};

export const AllDurations: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      <DurationBadge minutes={15} />
      <DurationBadge minutes={30} />
      <DurationBadge minutes={45} />
      <DurationBadge minutes={60} />
      <DurationBadge minutes={90} />
      <DurationBadge minutes={120} />
      <DurationBadge minutes={180} />
    </div>
  ),
};
