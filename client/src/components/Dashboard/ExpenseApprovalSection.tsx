import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Expense, User, ExpenseStatus, UserRole } from "@/types";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ExpenseModal } from "@/components/Expenses/ExpenseModal";
import { useAuth } from "@/hooks/use-auth";

export function ExpenseApprovalSection() {
  const { user, hasAnyRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpense, setSelectedExpense] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
  
  // Pagination
  const totalPages = Math.ceil((filteredExpenses?.length || 0) / itemsPerPage);
  const paginatedExpenses = filteredExpenses?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle view expense
  const handleViewExpense = (expenseId: number) => {
    setSelectedExpense(expenseId);
  };

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // If user is not a manager or admin, don't show this section
  if (!hasAnyRole([UserRole.MANAGER, UserRole.ADMIN])) {
    return null;
  }

  // Find user by id
  const findUser = (userId: number) => {
    return users.find(u => u.id === userId);
  };

  return (
    <div className="mt-8">
      <Card>
        <CardHeader className="px-4 py-5 sm:px-6 flex-row justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-neutral-dark">Pending Approvals</h3>
            <p className="mt-1 text-sm text-neutral-main">Expenses waiting for your review and approval.</p>
          </div>
          <div className="flex space-x-2">
            <div className="relative flex items-center max-w-xs">
              <Input
                type="text"
                className="shadow-sm focus:ring-primary-main focus:border-primary-main pr-10"
                placeholder="Search expenses"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="material-icons text-neutral-main">search</span>
              </div>
            </div>
            <Button variant="outline" size="icon" className="p-2">
              <span className="material-icons text-sm">filter_list</span>
            </Button>
          </div>
        </CardHeader>
        
        <div className="border-t border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-neutral-light">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Employee</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                // Loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="ml-4">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : paginatedExpenses?.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <p className="text-neutral-main text-sm">No pending expenses found.</p>
                  </td>
                </tr>
              ) : (
                // Expense rows
                paginatedExpenses?.map(expense => {
                  const expenseUser = findUser(expense.userId);
                  
                  return (
                    <tr key={expense.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserAvatar user={expenseUser || null} className="h-10 w-10" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-dark">
                              {expenseUser ? `${expenseUser.firstName} ${expenseUser.lastName}` : 'Unknown User'}
                            </div>
                            <div className="text-sm text-neutral-main">
                              {expenseUser?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-dark">
                          RWF {expense.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-dark capitalize">
                          {expense.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-dark">
                          {formatDate(expense.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-warning-light text-warning-dark">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="p-1 text-primary hover:text-primary-dark"
                            onClick={() => handleViewExpense(expense.id)}
                          >
                            <span className="material-icons text-sm">visibility</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="p-1 text-success-main hover:text-success-dark"
                            onClick={() => handleViewExpense(expense.id)}
                          >
                            <span className="material-icons text-sm">check</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="p-1 text-error-main hover:text-error-dark"
                            onClick={() => handleViewExpense(expense.id)}
                          >
                            <span className="material-icons text-sm">close</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <CardFooter className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-main">
                Showing <span className="font-medium">{filteredExpenses.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredExpenses.length)}</span> of <span className="font-medium">{filteredExpenses.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <span className="material-icons text-sm">chevron_left</span>
                </Button>
                {/* Page numbers */}
                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index + 1 ? "default" : "outline"}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                      currentPage === index + 1 
                        ? "bg-primary text-white" 
                        : "text-neutral-dark"
                    }`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <span className="material-icons text-sm">chevron_right</span>
                </Button>
              </nav>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Expense Modal */}
      {selectedExpense !== null && (
        <ExpenseModal
          expenseId={selectedExpense}
          onClose={() => setSelectedExpense(null)}
        />
      )}
    </div>
  );
}
