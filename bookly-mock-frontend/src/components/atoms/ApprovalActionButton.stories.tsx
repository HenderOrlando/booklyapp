import type { Meta, StoryObj } from "@storybook/react";
import { ApprovalActionButton } from "./ApprovalActionButton";

const meta: Meta<typeof ApprovalActionButton> = {
  title: "Atoms/ApprovalActionButton",
  component: ApprovalActionButton,
  tags: ["autodocs"],
  argTypes: {
    action: {
      control: "select",
      options: ["approve", "reject", "comment", "delegate"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    size: { control: "select", options: ["default", "sm", "lg", "icon"] },
  },
};

export default meta;
type Story = StoryObj<typeof ApprovalActionButton>;

export const Approve: Story = {
  args: { action: "approve", onClick: () => {} },
};

export const Reject: Story = {
  args: { action: "reject", onClick: () => {} },
};

export const Comment: Story = {
  args: { action: "comment", onClick: () => {} },
};

export const Delegate: Story = {
  args: { action: "delegate", onClick: () => {} },
};

export const Loading: Story = {
  args: { action: "approve", loading: true, onClick: () => {} },
};

export const AllActions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      <ApprovalActionButton action="approve" onClick={() => {}} />
      <ApprovalActionButton action="reject" onClick={() => {}} />
      <ApprovalActionButton action="comment" onClick={() => {}} />
      <ApprovalActionButton action="delegate" onClick={() => {}} />
    </div>
  ),
};
