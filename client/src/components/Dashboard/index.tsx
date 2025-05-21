import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StatusCards } from "@/components/Dashboard/StatusCards";
import { ExpenseApprovalSection } from "@/components/Dashboard/ExpenseApprovalSection";
import { RecentActivities } from "@/components/Dashboard/RecentActivities";
import { NewExpenseModal } from "@/components/Expenses/NewExpenseModal";
import { useState } from "react";
import { UserRole } from "@/types";
import { useAuth } from "@/hooks/use-auth";

export function Dashboard() {
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
  const { user } = useAuth();

  // Fetch expense stats for the current user
  const { data: expenseStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/expenses/stats/summary'],
  });

  return (
    <>
      <div className="md:flex md:items-center md:justify-between pb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-medium leading-7 text-neutral-dark">Dashboard</h2>
          <p className="mt-1 text-sm text-neutral-main">Overview of your expense activities and approvals</p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button 
            onClick={() => setShowNewExpenseModal(true)}
            className="ml-3 inline-flex items-center bg-primary hover:bg-primary-dark text-white"
          >
            <span className="material-icons text-sm mr-2">add</span>
            New Expense
          </Button>
        </div>
      </div>

      <StatusCards stats={expenseStats} isLoading={isLoadingStats} />
      
      {/* Show expense approval section only for managers and admins */}
      <ExpenseApprovalSection />
      
      <RecentActivities />

      {/* New Expense Modal */}
      {showNewExpenseModal && (
        <NewExpenseModal 
          onClose={() => setShowNewExpenseModal(false)} 
          onSuccess={() => {
            // Refresh queries after successfully creating an expense
            // No direct call needed as NewExpenseModal will handle this
          }}
        />
      )}
    </>
  );
}

export default Dashboard;
