import type { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";

const meta: Meta<typeof Select> = {
  title: "Atoms/Select",
  component: Select,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Selecciona una categoría" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="labs">Laboratorios</SelectItem>
        <SelectItem value="rooms">Salas de reunión</SelectItem>
        <SelectItem value="auditoriums">Auditorios</SelectItem>
        <SelectItem value="equipment">Equipos</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithError: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[280px]" error="Seleccione una opción" id="err-select">
        <SelectValue placeholder="Categoría requerida" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="labs">Laboratorios</SelectItem>
        <SelectItem value="rooms">Salas de reunión</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Deshabilitado" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Opción A</SelectItem>
      </SelectContent>
    </Select>
  ),
};
