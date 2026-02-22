import type { Meta, StoryObj } from "@storybook/react";
import { SearchBar } from "./SearchBar";

const meta: Meta<typeof SearchBar> = {
  title: "Molecules/SearchBar",
  component: SearchBar,
  tags: ["autodocs"],
  argTypes: {
    placeholder: { control: "text" },
    showAdvancedSearch: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {
  args: {
    value: "",
    onChange: () => {},
    placeholder: "Buscar recursos...",
  },
};

export const WithValue: Story = {
  args: {
    value: "Laboratorio",
    onChange: () => {},
    onClear: () => {},
  },
};

export const WithAdvancedSearch: Story = {
  args: {
    value: "",
    onChange: () => {},
    showAdvancedSearch: true,
    onAdvancedSearch: () => {},
  },
};
