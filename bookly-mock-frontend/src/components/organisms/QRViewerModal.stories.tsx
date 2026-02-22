import type { Meta, StoryObj } from "@storybook/react";
import { QRViewerModal } from "./QRViewerModal";

const meta: Meta<typeof QRViewerModal> = {
  title: "Organisms/QRViewerModal",
  component: QRViewerModal,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof QRViewerModal>;

export const Default: Story = {
  render: () => (
    <QRViewerModal
      isOpen={true}
      onClose={() => {}}
      qrValue="https://bookly.app/checkin/reservation-123"
      title="Código QR - Reserva #123"
    />
  ),
};
