import type { Meta, StoryObj } from "@storybook/react";
import { DatePicker } from "./DatePicker";

const meta: Meta<typeof DatePicker> = {
  title: "Molecules/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  args: {},
};

export const WithDate: Story = {
  args: { date: new Date() },
};

export const CustomPlaceholder: Story = {
  args: { placeholder: "Seleccione fecha de reserva" },
};

export const Disabled: Story = {
  args: { disabled: true },
};
