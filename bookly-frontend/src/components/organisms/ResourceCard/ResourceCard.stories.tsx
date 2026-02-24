import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../../atoms/Badge";
import { Button } from "../../atoms/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../atoms/Card";

const meta: Meta = {
  title: "Organisms/ResourceCard",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Available: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Sala de Conferencias A</CardTitle>
          <Badge variant="success">Disponible</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>📍 Edificio Principal, Piso 2</p>
        <p>👥 Capacidad: 20 personas</p>
        <p>🖥️ Proyector, Pizarra, Audio</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">Ver Detalles</Button>
        <Button size="sm">Reservar</Button>
      </CardFooter>
    </Card>
  ),
};

export const Maintenance: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Laboratorio de Redes</CardTitle>
          <Badge variant="warning">Mantenimiento</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>📍 Edificio B, Piso 1</p>
        <p>👥 Capacidad: 30 personas</p>
        <p>🔧 Mantenimiento preventivo hasta 20/06/2025</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" disabled>No disponible</Button>
      </CardFooter>
    </Card>
  ),
};

export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
      {[
        { name: "Sala A", status: "Disponible", variant: "success" as const, location: "Edificio A" },
        { name: "Lab. Redes", status: "Reservado", variant: "secondary" as const, location: "Edificio B" },
        { name: "Auditorio", status: "Mantenimiento", variant: "warning" as const, location: "Edificio C" },
      ].map((r) => (
        <Card key={r.name}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{r.name}</CardTitle>
              <Badge variant={r.variant}>{r.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">📍 {r.location}</p>
          </CardContent>
          <CardFooter>
            <Button size="sm" variant="outline">Ver</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  ),
};
