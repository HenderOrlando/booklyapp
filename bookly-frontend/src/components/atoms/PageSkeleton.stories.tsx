import type { Meta, StoryObj } from "@storybook/react";
import { PageSkeleton } from "./PageSkeleton";

const meta: Meta<typeof PageSkeleton> = {
  title: "Atoms/PageSkeleton",
  component: PageSkeleton,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["dashboard", "table", "form", "detail"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof PageSkeleton>;

export const Dashboard: Story = {
  args: { variant: "dashboard" },
};

export const Table: Story = {
  args: { variant: "table" },
};

export const Form: Story = {
  args: { variant: "form" },
};

export const Detail: Story = {
  args: { variant: "detail" },
};
