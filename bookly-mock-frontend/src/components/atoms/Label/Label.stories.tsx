import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./Label";

const meta: Meta<typeof Label> = {
  title: "Atoms/Label",
  component: Label,
  tags: ["autodocs"],
  argTypes: {
    required: { control: "boolean", description: "Muestra asterisco de campo requerido" },
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: { children: "Nombre del recurso" },
};

export const Required: Story = {
  args: { children: "Email", required: true },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <Label>Label normal</Label>
      <Label required>Label requerido</Label>
      <Label htmlFor="input-example">Label con htmlFor</Label>
    </div>
  ),
};
