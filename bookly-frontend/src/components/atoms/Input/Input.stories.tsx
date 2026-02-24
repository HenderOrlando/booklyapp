import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Atoms/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "tel", "url"],
      description: "Tipo de input HTML",
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    error: { control: "text", description: "Mensaje de error" },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: "Escribe aquí..." },
};

export const WithValue: Story = {
  args: { defaultValue: "Sala de conferencias A" },
};

export const WithPlaceholder: Story = {
  args: { placeholder: "Nombre del recurso" },
};

export const WithError: Story = {
  args: {
    id: "input-error",
    defaultValue: "",
    error: "Este campo es obligatorio",
    placeholder: "Campo requerido",
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: "No editable",
    disabled: true,
  },
};

export const Password: Story = {
  args: { type: "password", placeholder: "Contraseña" },
};

export const Search: Story = {
  args: { type: "search", placeholder: "Buscar recursos..." },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4 max-w-sm">
      <Input placeholder="Default" />
      <Input defaultValue="Con valor" />
      <Input id="err" error="Campo obligatorio" placeholder="Con error" />
      <Input disabled defaultValue="Deshabilitado" />
      <Input type="password" placeholder="Contraseña" />
    </div>
  ),
};
