import type { Meta, StoryObj } from "@storybook/react";
import { ExportButton } from "./ExportButton";

const meta: Meta<typeof ExportButton> = {
  title: "Atoms/ExportButton",
  component: ExportButton,
  tags: ["autodocs"],
  argTypes: {
    format: { control: "select", options: ["csv", "excel", "pdf"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["default", "outline", "ghost"] },
  },
};

export default meta;
type Story = StoryObj<typeof ExportButton>;

export const CSV: Story = {
  args: { format: "csv", onExport: () => {} },
};

export const Excel: Story = {
  args: { format: "excel", onExport: () => {} },
};

export const PDF: Story = {
  args: { format: "pdf", onExport: () => {} },
};

export const Loading: Story = {
  args: { format: "excel", loading: true, onExport: () => {} },
};

export const AllFormats: Story = {
  render: () => (
    <div className="flex gap-3 p-4">
      <ExportButton format="csv" onExport={() => {}} />
      <ExportButton format="excel" onExport={() => {}} />
      <ExportButton format="pdf" onExport={() => {}} />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3 p-4">
      <ExportButton format="excel" size="sm" onExport={() => {}} />
      <ExportButton format="excel" size="md" onExport={() => {}} />
      <ExportButton format="excel" size="lg" onExport={() => {}} />
    </div>
  ),
};
