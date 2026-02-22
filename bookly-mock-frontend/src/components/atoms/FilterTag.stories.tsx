import type { Meta, StoryObj } from "@storybook/react";
import { FilterTag } from "./FilterTag";

const meta: Meta<typeof FilterTag> = {
  title: "Atoms/FilterTag",
  component: FilterTag,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    value: { control: "text" },
    color: {
      control: "select",
      options: ["blue", "green", "purple", "orange", "red", "gray"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof FilterTag>;

export const Default: Story = {
  args: { label: "Categoría", value: "Laboratorios" },
};

export const Green: Story = {
  args: { label: "Estado", value: "Disponible", color: "green" },
};

export const Red: Story = {
  args: { label: "Estado", value: "No disponible", color: "red" },
};

export const WithRemove: Story = {
  args: {
    label: "Ubicación",
    value: "Edificio A",
    color: "purple",
    onRemove: () => alert("Filtro removido"),
  },
};

export const AllColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      <FilterTag label="Blue" value="Filtro" color="blue" onRemove={() => {}} />
      <FilterTag label="Green" value="Filtro" color="green" onRemove={() => {}} />
      <FilterTag label="Purple" value="Filtro" color="purple" onRemove={() => {}} />
      <FilterTag label="Orange" value="Filtro" color="orange" onRemove={() => {}} />
      <FilterTag label="Red" value="Filtro" color="red" onRemove={() => {}} />
      <FilterTag label="Gray" value="Filtro" color="gray" onRemove={() => {}} />
    </div>
  ),
};
