import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "./Calendar";

const meta: Meta<typeof Calendar> = {
  title: "Atoms/Calendar",
  component: Calendar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  args: {},
};

export const WithSelectedDate: Story = {
  args: {
    mode: "single",
    selected: new Date(),
  },
};

export const WithDisabledDates: Story = {
  args: {
    mode: "single",
    disabled: { before: new Date() },
  },
};
