import { useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Expense, User, UserRole, ExpenseStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Input } from "@/components/ui/input";
import { ExpenseModal } from "@/components/Expenses/ExpenseModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";

export default function ApprovalsPage() {
  const { hasAnyRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);

  // Check if user has permission to view this page
  if (!hasAnyRole([UserRole.MANAGER, UserRole.ADMIN])) {
    navigate("/dashboard");
    toast({
      title: "Access Denied",
      description: "You don't have permission to view this page.",
      variant: "destructive",
    });
    return null;
  }

  // Fetch pending approvals
  const { data: pendingExpenses, isLoading } = useQuery({
    queryKey: ['/api/expenses/pending-approvals'],
    enabled: hasAnyRole([UserRole.MANAGER, UserRole.ADMIN]),
  });

  // Fetch users for displaying employee info
  const { data: usersData } = useQuery({
    queryKey: ['/api/users'],
    enabled: hasAnyRole([UserRole.MANAGER, UserRole.ADMIN]),
  });

  const users = usersData as User[] || [];

  // Filter expenses based on search query
  const filteredExpenses = pendingExpenses 
    ? (pendingExpenses as Expense[]).filter(expense => {
        const user = users.find(u => u.id === expense.userId);
        const searchFields = [
          user?.firstName,
          user?.lastName,
          user?.email,
          expense.category,
          expense.description,
          expense.amount.toString()
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchQuery.trim() === '' || searchFields.includes(searchQuery.toLowerCase());
      })
    : [];

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Find user by id
  const findUser = (userId: number) => {
    return users.find(u => u.id === userId);
  };

  return (
    <MainLayout title="Pending Approvals">
      <div className="md:flex md:items-center md:justify-between pb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-medium leading-7 text-neutral-dark">Pending Approvals</h2>
          <p className="mt-1 text-sm text-neutral-main">Review and approve expense submissions from your team</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Team Expenses</CardTitle>
              <CardDescription>
                Expenses waiting for your review and approval
              </CardDescription>
            </div>
            <div className="mt-4 sm:mt-0 relative flex items-center">
              <Input
                type="text"
                className="shadow-sm focus:ring-primary focus:border-primary pr-10 w-full sm:w-64"
                placeholder="Search expenses"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="material-icons text-neutral-main">search</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            // Loading state
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-4 border rounded-md">
                  <div className="flex items-center">
                    <Skeleton className="h-12 w-12 rounded-full mr-4" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredExpenses.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <span className="material-icons text-4xl text-neutral-main mb-2">done_all</span>
              <h3 className="text-lg font-medium text-neutral-dark">No pending approvals</h3>
              <p className="text-neutral-main mt-1">
                {searchQuery ? "Try a different search term" : "You're all caught up!"}
              </p>
            </div>
          ) : (
            // Expense list
            <div className="space-y-4">
              {filteredExpenses.map((expense: Expense) => {
                const expenseUser = findUser(expense.userId);
                
                return (
                  <div 
                    key={expense.id} 
                    className="p-4 border rounded-md hover:bg-neutral-light transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center">
                        <UserAvatar user={expenseUser || null} className="h-12 w-12" />
                        <div className="ml-4">
                          <h4 className="font-medium text-neutral-dark">
                            {expenseUser ? `${expenseUser.firstName} ${expenseUser.lastName}` : 'Unknown User'}
                          </h4>
                          <p className="text-sm text-neutral-main">
                            <span className="capitalize">{expense.category}</span> - ${expense.amount.toFixed(2)} 
                            <span className="mx-1">•</span> 
                            <span>{formatDate(expense.createdAt)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex mt-4 sm:mt-0 space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-primary hover:text-primary-dark"
                          onClick={() => setSelectedExpenseId(expense.id)}
                        >
                          <span className="material-icons text-sm">visibility</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-success-main hover:text-success-dark"
                          onClick={() => setSelectedExpenseId(expense.id)}
                        >
                          <span className="material-icons text-sm">check</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-error-main hover:text-error-dark"
                          onClick={() => setSelectedExpenseId(expense.id)}
                        >
                          <span className="material-icons text-sm">close</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Detail Modal */}
      {selectedExpenseId !== null && (
        <ExpenseModal
          expenseId={selectedExpenseId}
          onClose={() => setSelectedExpenseId(null)}
        />
      )}
    </MainLayout>
  );
}
