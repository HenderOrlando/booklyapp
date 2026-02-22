import type { Meta, StoryObj } from "@storybook/react";
import { LoadingSpinner } from "./LoadingSpinner";

const meta: Meta<typeof LoadingSpinner> = {
  title: "Atoms/LoadingSpinner (Folder)",
  component: LoadingSpinner,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    text: { control: "text" },
    fullScreen: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {
  args: {},
};

export const WithText: Story = {
  args: { text: "Cargando recursos..." },
};

export const Small: Story = {
  args: { size: "sm", text: "Cargando..." },
};

export const Large: Story = {
  args: { size: "lg", text: "Procesando solicitud..." },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-8 p-4">
      <LoadingSpinner size="sm" text="Small" />
      <LoadingSpinner size="md" text="Medium" />
      <LoadingSpinner size="lg" text="Large" />
    </div>
  ),
};
