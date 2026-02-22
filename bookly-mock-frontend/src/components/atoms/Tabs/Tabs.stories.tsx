import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Atoms/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="overview">General</TabsTrigger>
        <TabsTrigger value="schedule">Horarios</TabsTrigger>
        <TabsTrigger value="history">Historial</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="p-4 text-sm text-muted-foreground">
          Información general del recurso.
        </p>
      </TabsContent>
      <TabsContent value="schedule">
        <p className="p-4 text-sm text-muted-foreground">
          Horarios de disponibilidad.
        </p>
      </TabsContent>
      <TabsContent value="history">
        <p className="p-4 text-sm text-muted-foreground">
          Historial de uso y reservas.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const TwoTabs: Story = {
  render: () => (
    <Tabs defaultValue="active" className="w-[300px]">
      <TabsList>
        <TabsTrigger value="active">Activas</TabsTrigger>
        <TabsTrigger value="past">Pasadas</TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <p className="p-4 text-sm">Reservas activas.</p>
      </TabsContent>
      <TabsContent value="past">
        <p className="p-4 text-sm">Reservas pasadas.</p>
      </TabsContent>
    </Tabs>
  ),
};
