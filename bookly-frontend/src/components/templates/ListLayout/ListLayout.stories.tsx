import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../../atoms/Badge";
import { Button } from "../../atoms/Button";
import { Card, CardContent } from "../../atoms/Card";
import { Input } from "../../atoms/Input";

const meta: Meta = {
  title: "Templates/ListLayout",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const ResourceList: Story = {
  render: () => (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recursos</h1>
        <Button>+ Nuevo Recurso</Button>
      </div>
      <div className="flex gap-4">
        <Input placeholder="Buscar recursos..." className="max-w-sm" />
        <Button variant="outline">Filtros</Button>
      </div>
      <div className="space-y-3">
        {[
          { name: "Sala A", category: "Salas", status: "Disponible", variant: "success" as const },
          { name: "Lab. Redes", category: "Laboratorios", status: "Reservado", variant: "secondary" as const },
          { name: "Auditorio", category: "Auditorios", status: "Mantenimiento", variant: "warning" as const },
          { name: "Sala B", category: "Salas", status: "Disponible", variant: "success" as const },
        ].map((r) => (
          <Card key={r.name}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-sm text-muted-foreground">{r.category}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={r.variant}>{r.status}</Badge>
                <Button variant="outline" size="sm">Ver</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  ),
};
