import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardHeader, CardTitle } from "../../atoms/Card";
import { Badge } from "../../atoms/Badge";

const meta: Meta = {
  title: "Molecules/ReservationCard",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Confirmed: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Sala de Conferencias A</CardTitle>
          <Badge variant="success">Confirmada</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>📅 15 de Junio, 2025</p>
          <p>🕐 09:00 - 11:00</p>
          <p>👤 Juan Pérez</p>
        </div>
      </CardContent>
    </Card>
  ),
};

export const Pending: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Laboratorio de Redes</CardTitle>
          <Badge variant="warning">Pendiente</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>📅 20 de Junio, 2025</p>
          <p>🕐 14:00 - 16:00</p>
          <p>👤 María García</p>
        </div>
      </CardContent>
    </Card>
  ),
};

export const Cancelled: Story = {
  render: () => (
    <Card className="w-[350px] opacity-75">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Auditorio Principal</CardTitle>
          <Badge variant="error">Cancelada</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>📅 10 de Junio, 2025</p>
          <p>🕐 10:00 - 12:00</p>
          <p>👤 Carlos López</p>
        </div>
      </CardContent>
    </Card>
  ),
};
