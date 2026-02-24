import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { ConfirmDialog } from "./ConfirmDialog";

const meta: Meta<typeof ConfirmDialog> = {
  title: "Molecules/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "destructive"] },
    loading: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Default: Story = {
  args: {
    open: true,
    title: "Confirmar reserva",
    description: "¿Desea confirmar esta reserva para la Sala de Conferencias A?",
    onClose: () => {},
    onConfirm: () => {},
  },
};

export const Destructive: Story = {
  args: {
    open: true,
    title: "Eliminar recurso",
    description: "Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar este recurso?",
    variant: "destructive",
    confirmText: "Eliminar",
    onClose: () => {},
    onConfirm: () => {},
  },
};

export const WithContent: Story = {
  args: {
    open: true,
    title: "Cancelar reserva",
    description: "Se cancelará la siguiente reserva:",
    variant: "destructive",
    confirmText: "Cancelar Reserva",
    onClose: () => {},
    onConfirm: () => {},
    children: (
      <div className="rounded-lg border p-3 text-sm">
        <p><strong>Recurso:</strong> Sala A</p>
        <p><strong>Fecha:</strong> 15 de Junio, 2025</p>
        <p><strong>Hora:</strong> 09:00 - 11:00</p>
      </div>
    ),
  },
};

export const Loading: Story = {
  args: {
    open: true,
    title: "Procesando",
    description: "Espere mientras se procesa la solicitud...",
    loading: true,
    onClose: () => {},
    onConfirm: () => {},
  },
};
