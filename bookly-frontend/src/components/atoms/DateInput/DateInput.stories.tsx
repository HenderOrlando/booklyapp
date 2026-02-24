import type { Meta, StoryObj } from "@storybook/react";
import { DateInput } from "./DateInput";

const meta: Meta<typeof DateInput> = {
  title: "Atoms/DateInput",
  component: DateInput,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof DateInput>;

export const Default: Story = {
  args: { label: "Fecha de reserva", id: "date-default" },
};

export const WithValue: Story = {
  args: { label: "Fecha", value: "2025-06-15", id: "date-val" },
};

export const Required: Story = {
  args: { label: "Fecha de inicio", required: true, id: "date-req" },
};

export const WithError: Story = {
  args: {
    label: "Fecha",
    error: "La fecha es obligatoria",
    id: "date-err",
  },
};

export const WithMinMax: Story = {
  args: {
    label: "Fecha de reserva",
    min: "2025-01-01",
    max: "2025-12-31",
    id: "date-minmax",
  },
};

export const Disabled: Story = {
  args: {
    label: "Fecha",
    value: "2025-06-15",
    disabled: true,
    id: "date-dis",
  },
};
