import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "../Label";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    checked: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Acepto los términos y condiciones</Label>
    </div>
  ),
};

export const MultipleOptions: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="projector" defaultChecked />
        <Label htmlFor="projector">Proyector</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="whiteboard" />
        <Label htmlFor="whiteboard">Pizarra</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="audio" />
        <Label htmlFor="audio">Sistema de audio</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-opt" disabled />
        <Label htmlFor="disabled-opt">No disponible</Label>
      </div>
    </div>
  ),
};
