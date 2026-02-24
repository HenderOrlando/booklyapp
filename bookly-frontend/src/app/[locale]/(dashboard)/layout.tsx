import { MainLayout } from "@/components/templates/MainLayout";

export default function DashboardLayoutGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
