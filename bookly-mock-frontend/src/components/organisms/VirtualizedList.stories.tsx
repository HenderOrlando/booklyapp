import type { Meta, StoryObj } from "@storybook/react";
import { VirtualizedList } from "./VirtualizedList";

const meta: Meta<typeof VirtualizedList> = {
  title: "Organisms/VirtualizedList",
  component: VirtualizedList,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof VirtualizedList>;

export const Default: Story = {
  args: {
    items: Array.from({ length: 100 }, (_, i) => ({
      id: `item-${i}`,
    })),
    renderItem: (item: { id: string }) => (
      <div className="border-b p-3 text-sm">{item.id}</div>
    ),
    itemHeight: 48,
  },
};
