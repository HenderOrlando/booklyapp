import type { Meta, StoryObj } from "@storybook/react";
import { QRCodeDisplay } from "./QRCodeDisplay";

const meta: Meta<typeof QRCodeDisplay> = {
  title: "Atoms/QRCodeDisplay",
  component: QRCodeDisplay,
  tags: ["autodocs"],
  argTypes: {
    value: { control: "text" },
    size: { control: "number" },
    level: { control: "select", options: ["L", "M", "Q", "H"] },
    includeMargin: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof QRCodeDisplay>;

export const Default: Story = {
  args: { value: "https://bookly.app/checkin/reservation-123" },
};

export const Small: Story = {
  args: { value: "RESERVATION-456", size: 128 },
};

export const Large: Story = {
  args: { value: "RESERVATION-789", size: 300 },
};

export const HighErrorCorrection: Story = {
  args: { value: "BOOKLY-CHECK-IN-ABC", level: "H", size: 200 },
};

export const WithMargin: Story = {
  args: { value: "BOOKLY-QR-DATA", includeMargin: true },
};
