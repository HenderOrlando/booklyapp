import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../../atoms/Badge";
import { InfoField } from "./InfoField";

const meta: Meta<typeof InfoField> = {
  title: "Molecules/InfoField",
  component: InfoField,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    variant: { control: "select", options: ["default", "inline", "card"] },
    fullWidth: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof InfoField>;

export const Default: Story = {
  args: { label: "Nombre", value: "Sala de Conferencias A" },
};

export const Inline: Story = {
  args: { label: "Estado", value: "Disponible", variant: "inline" },
};

export const Card: Story = {
  args: { label: "Ubicación", value: "Edificio Principal, Piso 2", variant: "card" },
};

export const WithComponent: Story = {
  args: {
    label: "Estado",
    value: <Badge variant="success">Disponible</Badge>,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-4">
      <InfoField label="Nombre" value="Sala A" variant="default" />
      <InfoField label="Estado" value="Disponible" variant="inline" />
      <InfoField label="Capacidad" value="20 personas" variant="card" />
      <InfoField label="Categoría" value="Laboratorio" variant="default" />
    </div>
  ),
};
