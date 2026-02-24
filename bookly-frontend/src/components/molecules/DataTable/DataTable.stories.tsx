import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../../atoms/Badge";
import { DataTable } from "./DataTable";

interface SampleResource {
  id: string;
  name: string;
  category: string;
  status: string;
  capacity: number;
}

const sampleData: SampleResource[] = [
  { id: "1", name: "Sala de Conferencias A", category: "Salas", status: "Disponible", capacity: 20 },
  { id: "2", name: "Laboratorio de Redes", category: "Laboratorios", status: "Reservado", capacity: 30 },
  { id: "3", name: "Auditorio Principal", category: "Auditorios", status: "Mantenimiento", capacity: 200 },
  { id: "4", name: "Sala de Reuniones B", category: "Salas", status: "Disponible", capacity: 10 },
  { id: "5", name: "Lab. Computación 1", category: "Laboratorios", status: "Disponible", capacity: 40 },
];

const columns = [
  { key: "name", header: "Nombre", cell: (item: SampleResource) => item.name, sortable: true },
  { key: "category", header: "Categoría", cell: (item: SampleResource) => item.category, sortable: true },
  {
    key: "status",
    header: "Estado",
    cell: (item: SampleResource) => {
      const variant = item.status === "Disponible" ? "success" : item.status === "Reservado" ? "secondary" : "warning";
      return <Badge variant={variant}>{item.status}</Badge>;
    },
  },
  { key: "capacity", header: "Capacidad", cell: (item: SampleResource) => `${item.capacity} personas` },
];

const meta: Meta<typeof DataTable<SampleResource>> = {
  title: "Molecules/DataTable",
  component: DataTable,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTable<SampleResource>>;

export const Default: Story = {
  args: {
    data: sampleData,
    columns,
    totalItems: sampleData.length,
  },
};

export const WithPagination: Story = {
  args: {
    data: sampleData,
    columns,
    currentPage: 1,
    totalPages: 3,
    pageSize: 5,
    totalItems: 15,
  },
};

export const Loading: Story = {
  args: {
    data: [],
    columns,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns,
    emptyMessage: "No se encontraron recursos",
  },
};
