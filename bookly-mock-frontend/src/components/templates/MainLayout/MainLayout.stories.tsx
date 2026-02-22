import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../atoms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../atoms/Card";

const meta: Meta = {
  title: "Templates/MainLayout",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-white p-4 space-y-4">
        <h2 className="text-lg font-bold text-blue-600">Bookly</h2>
        <nav className="space-y-1">
          {["Dashboard", "Recursos", "Reservas", "Aprobaciones", "Reportes", "Configuración"].map((item) => (
            <Button key={item} variant="ghost" className="w-full justify-start">{item}</Button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 space-y-6 bg-background">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-3 gap-4">
          {["Reservas Hoy", "Pendientes", "Recursos Activos"].map((title) => (
            <Card key={title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">--</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  ),
};
