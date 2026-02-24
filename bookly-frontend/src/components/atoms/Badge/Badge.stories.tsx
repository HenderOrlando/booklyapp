import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "warning", "error", "primary", "secondary", "outline"],
      description: "Variante visual del badge",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: "Default", variant: "default" },
};

export const Success: Story = {
  args: { children: "Disponible", variant: "success" },
};

export const Warning: Story = {
  args: { children: "En mantenimiento", variant: "warning" },
};

export const Error: Story = {
  args: { children: "No disponible", variant: "error" },
};

export const Primary: Story = {
  args: { children: "Primario", variant: "primary" },
};

export const Secondary: Story = {
  args: { children: "Secundario", variant: "secondary" },
};

export const Outline: Story = {
  args: { children: "Outline", variant: "outline" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      <Badge variant="default">Default</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};
