import type { Meta, StoryObj } from "@storybook/react";
import { ApprovalCardSkeleton } from "./ApprovalCardSkeleton";

const meta: Meta<typeof ApprovalCardSkeleton> = {
  title: "Molecules/ApprovalCardSkeleton",
  component: ApprovalCardSkeleton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ApprovalCardSkeleton>;

export const Default: Story = {};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <ApprovalCardSkeleton />
      <ApprovalCardSkeleton />
      <ApprovalCardSkeleton />
    </div>
  ),
};
