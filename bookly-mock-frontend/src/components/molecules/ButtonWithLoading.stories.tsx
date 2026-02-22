import type { Meta, StoryObj } from "@storybook/react";
import { ButtonWithLoading } from "./ButtonWithLoading";

const meta: Meta<typeof ButtonWithLoading> = {
  title: "Molecules/ButtonWithLoading",
  component: ButtonWithLoading,
  tags: ["autodocs"],
  argTypes: {
    isLoading: { control: "boolean" },
    loadingText: { control: "text" },
    variant: { control: "select", options: ["primary", "secondary", "outline", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonWithLoading>;

export const Default: Story = {
  args: { children: "Guardar", variant: "primary" },
};

export const Loading: Story = {
  args: { children: "Guardar", isLoading: true, loadingText: "Guardando..." },
};

export const Secondary: Story = {
  args: { children: "Exportar", variant: "secondary" },
};

export const Outline: Story = {
  args: { children: "Cancelar", variant: "outline" },
};

export const Danger: Story = {
  args: { children: "Eliminar", variant: "danger" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      <ButtonWithLoading variant="primary">Primary</ButtonWithLoading>
      <ButtonWithLoading variant="secondary">Secondary</ButtonWithLoading>
      <ButtonWithLoading variant="outline">Outline</ButtonWithLoading>
      <ButtonWithLoading variant="danger">Danger</ButtonWithLoading>
      <ButtonWithLoading variant="primary" isLoading loadingText="Cargando...">Primary</ButtonWithLoading>
    </div>
  ),
};
