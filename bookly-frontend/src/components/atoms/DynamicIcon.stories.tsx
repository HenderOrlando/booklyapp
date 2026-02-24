import type { Meta, StoryObj } from "@storybook/react";
import { DynamicIcon } from "./DynamicIcon";

const meta: Meta<typeof DynamicIcon> = {
  title: "Atoms/DynamicIcon",
  component: DynamicIcon,
  tags: ["autodocs"],
  argTypes: {
    name: { control: "text", description: "Nombre del icono Lucide" },
  },
};

export default meta;
type Story = StoryObj<typeof DynamicIcon>;

export const Calendar: Story = {
  args: { name: "Calendar", className: "h-6 w-6" },
};

export const User: Story = {
  args: { name: "User", className: "h-6 w-6" },
};

export const Building: Story = {
  args: { name: "Building2", className: "h-6 w-6" },
};

export const Unknown: Story = {
  args: { name: "NonExistentIcon", className: "h-6 w-6" },
};

export const IconGallery: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-4 p-4">
      {["Calendar", "Clock", "User", "Building2", "Search", "Bell", "Settings", "Home", "Mail", "Shield", "FileText", "Download"].map((name) => (
        <div key={name} className="flex flex-col items-center gap-2 p-2 rounded-lg border">
          <DynamicIcon name={name} className="h-6 w-6" />
          <span className="text-xs text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  ),
};
