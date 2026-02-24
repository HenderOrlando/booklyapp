import type { Meta, StoryObj } from "@storybook/react";
import { CheckInButton } from "./CheckInButton";

const meta: Meta<typeof CheckInButton> = {
  title: "Atoms/CheckInButton",
  component: CheckInButton,
  tags: ["autodocs"],
  argTypes: {
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    size: { control: "select", options: ["default", "sm", "lg", "icon"] },
  },
};

export default meta;
type Story = StoryObj<typeof CheckInButton>;

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

export const CustomText: Story = {
  args: { onClick: () => {}, children: "Registrar entrada" },
};
