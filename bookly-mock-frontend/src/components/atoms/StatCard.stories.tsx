import type { Meta, StoryObj } from "@storybook/react";
import { Calendar, Users, Building2, Clock } from "lucide-react";
import { StatCard } from "./StatCard";

const meta: Meta<typeof StatCard> = {
  title: "Atoms/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    value: { control: "text" },
    change: { control: "number" },
    trend: { control: "select", options: ["up", "down", "neutral"] },
    loading: { control: "boolean" },
    subtitle: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    title: "Total Reservas",
    value: "1,234",
    change: 12.5,
    trend: "up",
    icon: <Calendar className="h-6 w-6" />,
  },
};

export const TrendDown: Story = {
  args: {
    title: "Cancelaciones",
    value: "45",
    change: 8.3,
    trend: "down",
    icon: <Clock className="h-6 w-6" />,
  },
};

export const Neutral: Story = {
  args: {
    title: "Recursos Activos",
    value: "87",
    trend: "neutral",
    icon: <Building2 className="h-6 w-6" />,
  },
};

export const WithSubtitle: Story = {
  args: {
    title: "Usuarios Activos",
    value: "523",
    subtitle: "Último mes",
    icon: <Users className="h-6 w-6" />,
  },
};

export const Loading: Story = {
  args: { title: "", value: "", loading: true },
};

export const KPIGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-4 lg:grid-cols-4">
      <StatCard title="Total Reservas" value="1,234" change={12.5} trend="up" icon={<Calendar className="h-6 w-6" />} />
      <StatCard title="Usuarios" value="523" change={5.2} trend="up" icon={<Users className="h-6 w-6" />} />
      <StatCard title="Recursos" value="87" trend="neutral" icon={<Building2 className="h-6 w-6" />} />
      <StatCard title="Cancelaciones" value="45" change={8.3} trend="down" icon={<Clock className="h-6 w-6" />} />
    </div>
  ),
};
