import type { Meta, StoryObj } from "@storybook/react";
import { DateRangePicker } from "./DateRangePicker";

const meta: Meta<typeof DateRangePicker> = {
  title: "Molecules/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

export const Default: Story = {
  render: () => <DateRangePicker onRangeChange={() => {}} />,
};
