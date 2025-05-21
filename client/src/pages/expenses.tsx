import { useState, useEffect } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Expense, ExpenseStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import { ExpenseModal } from "@/components/Expenses/ExpenseModal";
import { NewExpenseModal } from "@/components/Expenses/NewExpenseModal";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const params = useParams();
  const [location, setLocation] = useLocation();
  
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(
    params.id ? parseInt(params.id) : null
  );

  // Reset selected expense when params change
  useEffect(() => {
    if (params.id) {
      setSelectedExpenseId(parseInt(params.id));
    }
  }, [params.id]);

  // Fetch user's expenses
  const { data: expenses, isLoading } = useQuery({
    queryKey: ['/api/expenses/my-expenses'],
  });

  // Filter expenses based on active tab and search query
  const filteredExpenses = expenses 
    ? (expenses as Expense[]).filter(expense => {
        // Filter by status if not "all"
        const statusMatch = 
          activeTab === "all" || 
          expense.status.toLowerCase() === activeTab;
        
        // Filter by search query
        const searchMatch = searchQuery.trim() === '' || 
          expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          expense.amount.toString().includes(searchQuery);
        
        return statusMatch && searchMatch;
      })
    : [];

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle view expense details
  const handleViewExpense = (id: number) => {
    setSelectedExpenseId(id);
    setLocation(`/expenses/${id}`);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status: ExpenseStatus) => {
    switch (status) {
      case ExpenseStatus.PENDING:
        return "status-pending";
      case ExpenseStatus.APPROVED:
        return "status-approved";
      case ExpenseStatus.REJECTED:
        return "status-rejected";
      default:
        return "";
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setSelectedExpenseId(null);
    setLocation("/expenses");
  };

  return (
    <MainLayout title="My Expenses">
      <div className="md:flex md:items-center md:justify-between pb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-medium leading-7 text-neutral-dark">My Expenses</h2>
          <p className="mt-1 text-sm text-neutral-main">View and manage your expense submissions</p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button 
            onClick={() => setShowNewExpenseModal(true)}
            className="inline-flex items-center bg-primary hover:bg-primary-dark text-white"
          >
            <span className="material-icons text-sm mr-2">add</span>
            New Expense
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Expense History</CardTitle>
              <CardDescription>
                Review your past and current expense submissions
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
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                // Loading state
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="p-4 border rounded-md">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <Skeleton className="h-5 w-24 mb-2" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                        <div className="flex mt-4 md:mt-0 space-x-4">
                          <Skeleton className="h-10 w-20 rounded-md" />
                          <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredExpenses.length === 0 ? (
                // Empty state
                <div className="text-center py-12">
                  <span className="material-icons text-4xl text-neutral-main mb-2">receipt_long</span>
                  <h3 className="text-lg font-medium text-neutral-dark">No expenses found</h3>
                  <p className="text-neutral-main mt-1">
                    {searchQuery ? "Try a different search term" : "Submit a new expense to get started"}
                  </p>
                  <Button 
                    onClick={() => setShowNewExpenseModal(true)}
                    variant="outline" 
                    className="mt-4"
                  >
                    Submit New Expense
                  </Button>
                </div>
              ) : (
                // Expense list
                <div className="space-y-4">
                  {filteredExpenses.map((expense: Expense) => (
                    <div 
                      key={expense.id} 
                      className="p-4 border rounded-md hover:bg-neutral-light transition-colors cursor-pointer"
                      onClick={() => handleViewExpense(expense.id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h4 className="font-medium text-neutral-dark capitalize">
                            {expense.category} - ${expense.amount.toFixed(2)}
                          </h4>
                          <p className="text-sm text-neutral-main mt-1 line-clamp-1">
                            {expense.description}
                          </p>
                          <p className="text-xs text-neutral-main mt-2">
                            Submitted on {formatDate(expense.createdAt)}
                          </p>
                        </div>
                        <div className="flex mt-4 md:mt-0 items-center space-x-4">
                          <span className={getStatusBadgeClass(expense.status as ExpenseStatus)}>
                            {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-primary hover:text-primary-dark"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewExpense(expense.id);
                            }}
                          >
                            <span className="material-icons">visibility</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* New Expense Modal */}
      {showNewExpenseModal && (
        <NewExpenseModal 
          onClose={() => setShowNewExpenseModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/expenses/my-expenses'] });
            toast({
              title: "Success",
              description: "Your expense has been submitted for approval",
            });
          }}
        />
      )}

      {/* Expense Detail Modal */}
      {selectedExpenseId !== null && (
        <ExpenseModal
          expenseId={selectedExpenseId}
          onClose={handleModalClose}
        />
      )}
    </MainLayout>
  );
}
