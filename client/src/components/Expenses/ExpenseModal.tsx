import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExpenseWithComments, ExpenseStatus, UserRole } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { RejectFormModal } from "./RejectFormModal";
import { apiRequest } from "@/lib/queryClient";

interface ExpenseModalProps {
  expenseId: number;
  onClose: () => void;
}

export function ExpenseModal({ expenseId, onClose }: ExpenseModalProps) {
  const { toast } = useToast();
  const { user, hasAnyRole } = useAuth();
  const queryClient = useQueryClient();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [open, setOpen] = useState(true);
  
  // Close the modal
  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300); // Allow animation to complete
  };

  // Fetch expense details
  const { data, isLoading } = useQuery({
    queryKey: [`/api/expenses/${expenseId}`],
    enabled: !!expenseId,
  });

  const expenseData = data as ExpenseWithComments | undefined;

  // Approve expense mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(
        'PATCH',
        `/api/expenses/${expenseId}/status`,
        { status: ExpenseStatus.APPROVED }
      );
    },
    onSuccess: () => {
      toast({
        title: "Expense Approved",
        description: "The expense has been successfully approved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses/pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reports/activity-logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses/stats/summary'] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve expense",
        variant: "destructive",
      });
    },
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle approve
  const handleApprove = () => {
    approveMutation.mutate();
  };

  // Handle reject
  const handleReject = () => {
    setShowRejectModal(true);
    setOpen(false);
  };

  // Check if user can approve/reject
  const canApprove = hasAnyRole([UserRole.MANAGER, UserRole.ADMIN]) && 
                     expenseData?.expense.status === ExpenseStatus.PENDING;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          
          {isLoading ? (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="sm:col-span-3">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="sm:col-span-3">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="sm:col-span-3">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="sm:col-span-6">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-5 w-full" />
                </div>
                <div className="sm:col-span-6">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-40 w-full rounded-md" />
                </div>
              </div>
            </div>
          ) : expenseData ? (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-neutral-main">Employee</label>
                  <div className="mt-1 text-sm text-neutral-dark">
                    {/* This would need to be fetched from user data in a real implementation */}
                    Employee #{expenseData.expense.userId}
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-neutral-main">Submission Date</label>
                  <div className="mt-1 text-sm text-neutral-dark">
                    {formatDate(expenseData.expense.createdAt)}
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-neutral-main">Category</label>
                  <div className="mt-1 text-sm text-neutral-dark capitalize">
                    {expenseData.expense.category}
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-neutral-main">Amount</label>
                  <div className="mt-1 text-sm text-neutral-dark">
                    RWF {expenseData.expense.amount.toFixed(2)}
                  </div>
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-neutral-main">Description</label>
                  <div className="mt-1 text-sm text-neutral-dark">
                    {expenseData.expense.description}
                  </div>
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-neutral-main">Invoice</label>
                  <div className="mt-1">
                    <img 
                      src={`/api/expenses/${expenseData.expense.id}/receipt`} 
                      alt="Invoice" 
                      className="h-40 w-auto object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Invoice+Not+Available';
                      }}
                    />
                  </div>
                </div>
                
                {expenseData.comments.length > 0 && (
                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-neutral-main">Comments</label>
                    <div className="mt-1">
                      {expenseData.comments.map((comment) => (
                        <div key={comment.id} className="mb-2 p-2 bg-neutral-light rounded">
                          <p className="text-sm text-neutral-dark">{comment.content}</p>
                          <p className="text-xs text-neutral-main mt-1">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-neutral-main">Failed to load expense details.</p>
            </div>
          )}
          
          <DialogFooter className="bg-neutral-light px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {canApprove && (
              <>
                <Button
                  type="button"
                  className="w-full inline-flex justify-center bg-success-main hover:bg-success-dark sm:ml-3 sm:w-auto"
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending ? "Approving..." : "Approve"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="mt-3 w-full inline-flex justify-center bg-error-main hover:bg-error-dark sm:mt-0 sm:ml-3 sm:w-auto"
                  onClick={handleReject}
                >
                  Reject
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full inline-flex justify-center sm:mt-0 sm:ml-3 sm:w-auto"
              onClick={handleClose}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject form modal */}
      {showRejectModal && (
        <RejectFormModal
          expenseId={expenseId}
          onClose={() => {
            setShowRejectModal(false);
            onClose();
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
            queryClient.invalidateQueries({ queryKey: ['/api/expenses/pending-approvals'] });
            queryClient.invalidateQueries({ queryKey: ['/api/reports/activity-logs'] });
            queryClient.invalidateQueries({ queryKey: ['/api/expenses/stats/summary'] });
          }}
        />
      )}
    </>
  );
}
