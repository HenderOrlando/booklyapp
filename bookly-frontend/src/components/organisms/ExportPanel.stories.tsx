import type { Meta, StoryObj } from "@storybook/react";
import { ExportPanel } from "./ExportPanel";

const meta: Meta<typeof ExportPanel> = {
  title: "Organisms/ExportPanel",
  component: ExportPanel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ExportPanel>;

export const Default: Story = {
  args: {
    onExport: () => {},
  },
};
