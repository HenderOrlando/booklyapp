import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardHeader, CardTitle } from "../../atoms/Card";

const meta: Meta = {
  title: "Templates/DashboardLayout",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white px-6 py-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </header>
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {["Reservas", "Usuarios", "Recursos", "Ocupación"].map((title) => (
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
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Tendencia</CardTitle></CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
              Área de gráfico
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Actividad</CardTitle></CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
              Actividad reciente
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  ),
};
