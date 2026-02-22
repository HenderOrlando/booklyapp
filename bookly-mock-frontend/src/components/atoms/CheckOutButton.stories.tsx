import type { Meta, StoryObj } from "@storybook/react";
import { CheckOutButton } from "./CheckOutButton";

const meta: Meta<typeof CheckOutButton> = {
  title: "Atoms/CheckOutButton",
  component: CheckOutButton,
  tags: ["autodocs"],
  argTypes: {
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    size: { control: "select", options: ["default", "sm", "lg", "icon"] },
  },
};

export default meta;
type Story = StoryObj<typeof CheckOutButton>;

export const Default: Story = {
  args: { onClick: () => {} },
};

export const Loading: Story = {
  args: { onClick: () => {}, loading: true },
};

export const Disabled: Story = {
  args: { onClick: () => {}, disabled: true },
};

export const Small: Story = {
  args: { onClick: () => {}, size: "sm" },
};
