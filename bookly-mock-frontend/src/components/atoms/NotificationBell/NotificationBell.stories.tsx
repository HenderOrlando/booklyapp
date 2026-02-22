import type { Meta, StoryObj } from "@storybook/react";
import { NotificationBell } from "./NotificationBell";

const meta: Meta<typeof NotificationBell> = {
  title: "Atoms/NotificationBell",
  component: NotificationBell,
  tags: ["autodocs"],
  argTypes: {
    count: { control: "number", description: "Cantidad de notificaciones no leídas" },
  },
};

export default meta;
type Story = StoryObj<typeof NotificationBell>;

export const NoNotifications: Story = {
  args: { count: 0 },
};

export const FewNotifications: Story = {
  args: { count: 3 },
};

export const ManyNotifications: Story = {
  args: { count: 42 },
};

export const OverflowCount: Story = {
  args: { count: 150 },
};

export const AllCounts: Story = {
  render: () => (
    <div className="flex items-center gap-6 p-4">
      <NotificationBell count={0} />
      <NotificationBell count={1} />
      <NotificationBell count={9} />
      <NotificationBell count={42} />
      <NotificationBell count={100} />
    </div>
  ),
};
