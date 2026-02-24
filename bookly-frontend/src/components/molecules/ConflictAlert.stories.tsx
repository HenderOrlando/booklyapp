import type { Meta, StoryObj } from "@storybook/react";
import { ConflictAlert } from "./ConflictAlert";

const meta: Meta<typeof ConflictAlert> = {
  title: "Molecules/ConflictAlert",
  component: ConflictAlert,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ConflictAlert>;

export const Default: Story = {
  args: {
    resourceId: "resource-1",
    startDate: "2025-06-15T09:00:00Z",
    endDate: "2025-06-15T11:00:00Z",
  },
};
