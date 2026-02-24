import type { Meta, StoryObj } from "@storybook/react";
import { TimeInput } from "./TimeInput";

const meta: Meta<typeof TimeInput> = {
  title: "Atoms/TimeInput",
  component: TimeInput,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "text" },
    step: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof TimeInput>;

export const Default: Story = {
  args: { label: "Hora de inicio", id: "time-default" },
};

export const WithValue: Story = {
  args: { label: "Hora", value: "09:30", id: "time-val" },
};

export const Required: Story = {
  args: { label: "Hora de inicio", required: true, id: "time-req" },
};

export const WithError: Story = {
  args: {
    label: "Hora",
    error: "La hora es obligatoria",
    id: "time-err",
  },
};

export const WithMinMax: Story = {
  args: {
    label: "Hora de reserva",
    min: "08:00",
    max: "18:00",
    step: 30,
    id: "time-minmax",
  },
};

export const Disabled: Story = {
  args: {
    label: "Hora",
    value: "14:00",
    disabled: true,
    id: "time-dis",
  },
};
