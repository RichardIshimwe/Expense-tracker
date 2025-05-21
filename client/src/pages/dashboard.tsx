import { MainLayout } from "@/components/Layout/MainLayout";
import { Dashboard } from "@/components/Dashboard";

export default function DashboardPage() {
  return (
    <MainLayout title="Expense Approval Workflow">
      <Dashboard />
    </MainLayout>
  );
}
