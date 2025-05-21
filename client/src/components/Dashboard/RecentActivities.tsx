import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuditLog } from "@/types";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function RecentActivities() {
  // Fetch recent audit logs
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['/api/reports/activity-logs'],
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get icon and color based on action type
  const getActivityIcon = (action: string) => {
    if (action.includes('APPROVED')) {
      return { icon: 'check_circle', color: 'text-success-main' };
    } 
    if (action.includes('REJECTED')) {
      return { icon: 'highlight_off', color: 'text-error-main' };
    }
    if (action.includes('CREATED')) {
      return { icon: 'receipt_long', color: 'text-primary-main' };
    }
    return { icon: 'info', color: 'text-neutral-main' };
  };

  // Format action message
  const formatActivityMessage = (log: AuditLog) => {
    if (log.expense) {
      if (log.action === 'EXPENSE_APPROVED') {
        return (
          <>
            <span className="capitalize">{log.expense.category}</span> expense for <strong>${log.expense.amount.toFixed(2)}</strong> has been approved by <span className="font-medium">{log.userName}</span>
          </>
        );
      }
      if (log.action === 'EXPENSE_REJECTED') {
        return (
          <>
            <span className="capitalize">{log.expense.category}</span> expense for <strong>${log.expense.amount.toFixed(2)}</strong> has been rejected by <span className="font-medium">{log.userName}</span>
          </>
        );
      }
      if (log.action === 'EXPENSE_CREATED') {
        return (
          <>
            New expense of <strong>${log.expense.amount.toFixed(2)}</strong> for <span className="capitalize">{log.expense.category}</span> submitted by <span className="font-medium">{log.expense.ownerName}</span>
          </>
        );
      }
    }
    
    // Default message if we can't determine the specific format
    return log.details;
  };

  return (
    <div className="mt-8">
      <Card>
        <CardHeader className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-neutral-dark">Recent Activities</h3>
            <p className="mt-1 text-sm text-neutral-main">Latest updates from your expenses and approvals.</p>
          </div>
        </CardHeader>
        
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {isLoading ? (
              // Loading state
              Array.from({ length: 3 }).map((_, index) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center">
                    <div className="min-w-0 flex-1 flex items-center">
                      <div className="flex-shrink-0">
                        <Skeleton className="h-6 w-6 rounded-full" />
                      </div>
                      <div className="min-w-0 flex-1 px-4">
                        <div>
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </li>
              ))
            ) : (auditLogs as AuditLog[])?.length === 0 ? (
              // Empty state
              <li className="px-4 py-8 text-center">
                <p className="text-neutral-main text-sm">No recent activities.</p>
              </li>
            ) : (
              // Activity items
              (auditLogs as AuditLog[])?.slice(0, 3).map((log) => {
                const { icon, color } = getActivityIcon(log.action);
                
                return (
                  <li key={log.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="min-w-0 flex-1 flex items-center">
                        <div className="flex-shrink-0">
                          <span className={`material-icons ${color}`}>{icon}</span>
                        </div>
                        <div className="min-w-0 flex-1 px-4">
                          <div>
                            <p className="text-sm text-neutral-dark">
                              {formatActivityMessage(log)}
                            </p>
                            <p className="mt-1 text-sm text-neutral-main">
                              {formatDate(log.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        {log.expenseId && (
                          <Link href={`/expenses/${log.expenseId}`}>
                            <Button variant="ghost" size="icon" className="p-1 text-primary hover:text-primary-dark">
                              <span className="material-icons text-sm">open_in_new</span>
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })
            )}
            
            <li className="px-4 py-4 sm:px-6 text-center">
              <Link href="/reports">
                <Button variant="link" className="text-sm text-primary hover:text-primary-dark font-medium">
                  View all activities
                </Button>
              </Link>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
