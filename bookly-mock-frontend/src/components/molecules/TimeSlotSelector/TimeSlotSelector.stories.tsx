import type { Meta, StoryObj } from "@storybook/react";
import { TimeSlotSelector } from "./TimeSlotSelector";

const sampleSlots = [
  { id: "s1", startTime: "08:00", endTime: "09:00", available: true },
  { id: "s2", startTime: "09:00", endTime: "10:00", available: true },
  { id: "s3", startTime: "10:00", endTime: "11:00", available: false },
  { id: "s4", startTime: "11:00", endTime: "12:00", available: true },
  { id: "s5", startTime: "12:00", endTime: "13:00", available: false },
  { id: "s6", startTime: "13:00", endTime: "14:00", available: true },
  { id: "s7", startTime: "14:00", endTime: "15:00", available: true },
  { id: "s8", startTime: "15:00", endTime: "16:00", available: true },
  { id: "s9", startTime: "16:00", endTime: "17:00", available: false },
  { id: "s10", startTime: "17:00", endTime: "18:00", available: true },
];

const meta: Meta<typeof TimeSlotSelector> = {
  title: "Molecules/TimeSlotSelector",
  component: TimeSlotSelector,
  tags: ["autodocs"],
  argTypes: {
    mode: { control: "select", options: ["single", "range"] },
    disabled: { control: "boolean" },
    showIndicator: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof TimeSlotSelector>;

export const Default: Story = {
  args: {
    slots: sampleSlots,
    onSelectSlot: () => {},
  },
};

export const WithSelected: Story = {
  args: {
    slots: sampleSlots,
    selectedSlots: ["s2", "s4"],
    onSelectSlot: () => {},
  },
};

export const Disabled: Story = {
  args: {
    slots: sampleSlots,
    disabled: true,
  },
};
