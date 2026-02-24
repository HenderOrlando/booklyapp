import type { Meta, StoryObj } from "@storybook/react";
import { Toast } from "../atoms/Toast";

const meta: Meta = {
  title: "Organisms/ToastContainer",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <Toast id="1" type="success" title="Éxito" message="La reserva se creó correctamente." onClose={() => {}} />
      <Toast id="2" type="error" title="Error" message="No se pudo completar la operación." onClose={() => {}} />
      <Toast id="3" type="warning" title="Advertencia" message="El recurso estará en mantenimiento." onClose={() => {}} />
      <Toast id="4" type="info" title="Información" message="Se ha actualizado la configuración." onClose={() => {}} />
    </div>
  ),
};
