import type { Meta, StoryObj } from "@storybook/react";
import { FilterChips } from "./FilterChips";

const meta: Meta<typeof FilterChips> = {
  title: "Molecules/FilterChips",
  component: FilterChips,
  tags: ["autodocs"],
  argTypes: {
    showClearAll: { control: "boolean" },
    clearAllText: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof FilterChips>;

export const SingleFilter: Story = {
  args: {
    filters: [{ key: "status", label: "Estado", value: "Disponible" }],
    onRemove: () => {},
  },
};

export const MultipleFilters: Story = {
  args: {
    filters: [
      { key: "status", label: "Estado", value: "Disponible" },
      { key: "category", label: "Categoría", value: "Laboratorios" },
      { key: "location", label: "Ubicación", value: "Edificio A" },
    ],
    onRemove: () => {},
    onClearAll: () => {},
  },
};

export const Empty: Story = {
  args: {
    filters: [],
    onRemove: () => {},
  },
};

export const NoClearAll: Story = {
  args: {
    filters: [
      { key: "status", label: "Estado", value: "Reservado" },
      { key: "type", label: "Tipo", value: "Sala" },
    ],
    onRemove: () => {},
    showClearAll: false,
  },
};
