import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../../atoms/Badge";
import { Button } from "../../atoms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../atoms/Card";

const meta: Meta = {
  title: "Templates/DetailLayout",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const ResourceDetail: Story = {
  render: () => (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">← Volver</Button>
          <h1 className="text-2xl font-bold">Sala de Conferencias A</h1>
          <Badge variant="success">Disponible</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Editar</Button>
          <Button>Reservar</Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Información General</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Ubicación</span><span>Edificio A, Piso 2</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Capacidad</span><span>20 personas</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Categoría</span><span>Salas de reunión</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Responsable</span><span>Decanatura</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Equipamiento</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Proyector</Badge>
              <Badge variant="outline">Pizarra</Badge>
              <Badge variant="outline">Audio</Badge>
              <Badge variant="outline">WiFi</Badge>
              <Badge variant="outline">Aire acondicionado</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};
