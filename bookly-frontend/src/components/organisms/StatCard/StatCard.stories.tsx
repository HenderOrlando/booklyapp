import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardHeader, CardTitle } from "../../atoms/Card";

const meta: Meta = {
  title: "Organisms/StatCard",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-4 lg:grid-cols-4">
      {[
        { title: "Reservas Totales", value: "1,234", color: "text-blue-600" },
        { title: "Usuarios Activos", value: "523", color: "text-green-600" },
        { title: "Recursos", value: "87", color: "text-purple-600" },
        { title: "Ocupación", value: "78%", color: "text-orange-600" },
      ].map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};
