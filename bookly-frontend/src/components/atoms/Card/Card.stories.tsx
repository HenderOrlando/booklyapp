import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Atoms/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Sala de Conferencias A</CardTitle>
        <CardDescription>Edificio principal, piso 2</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Capacidad: 20 personas. Equipada con proyector y pizarra.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="default" size="sm">Reservar</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardContent className="pt-6">
        <p>Contenido simple sin header ni footer.</p>
      </CardContent>
    </Card>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Recurso</CardTitle>
        <CardDescription>Gestiona este recurso</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Laboratorio de Computación 1</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">Cancelar</Button>
        <Button variant="default" size="sm">Guardar</Button>
      </CardFooter>
    </Card>
  ),
};
