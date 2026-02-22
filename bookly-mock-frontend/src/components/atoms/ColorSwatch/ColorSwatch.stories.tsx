import type { Meta, StoryObj } from "@storybook/react";
import { ColorSwatch } from "./ColorSwatch";

const meta: Meta<typeof ColorSwatch> = {
  title: "Atoms/ColorSwatch",
  component: ColorSwatch,
  tags: ["autodocs"],
  argTypes: {
    color: { control: "color" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    bordered: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ColorSwatch>;

export const Default: Story = {
  args: { color: "#2563EB" },
};

export const Small: Story = {
  args: { color: "#14B8A6", size: "sm" },
};

export const Large: Story = {
  args: { color: "#EF4444", size: "lg" },
};

export const NoBorder: Story = {
  args: { color: "#F97316", bordered: false },
};

export const Palette: Story = {
  render: () => (
    <div className="flex gap-3 p-4">
      <ColorSwatch color="#2563EB" title="Primary" />
      <ColorSwatch color="#14B8A6" title="Secondary" />
      <ColorSwatch color="#22C55E" title="Success" />
      <ColorSwatch color="#F97316" title="Warning" />
      <ColorSwatch color="#EF4444" title="Error" />
    </div>
  ),
};
