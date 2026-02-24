import type { Meta, StoryObj } from "@storybook/react";
import { InfiniteResourceList } from "./InfiniteResourceList";

const meta: Meta<typeof InfiniteResourceList> = {
  title: "Organisms/InfiniteResourceList",
  component: InfiniteResourceList,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InfiniteResourceList>;

export const Default: Story = {
  render: () => (
    <InfiniteResourceList
      renderItem={(resource) => (
        <div className="border-b p-3 text-sm">{resource.name}</div>
      )}
    />
  ),
};
