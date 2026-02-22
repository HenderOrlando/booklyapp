import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog";

const meta: Meta<typeof Dialog> = {
  title: "Atoms/Dialog",
  component: Dialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar acción</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas continuar con esta operación?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Crear Recurso</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Recurso</DialogTitle>
          <DialogDescription>
            Complete los datos del recurso a registrar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <input
            className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Nombre del recurso"
          />
          <input
            className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Ubicación"
          />
        </div>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
