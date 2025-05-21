import { useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { AuditLog, UserRole, ExpenseStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ReportsPage() {
  const { hasAnyRole } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [activeTab, setActiveTab] = useState("activity");
  const [exportStatus, setExportStatus] = useState<ExpenseStatus | "all">("all");

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

  // Fetch audit logs
  const { data: auditLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['/api/reports/activity-logs'],
    enabled: hasAnyRole([UserRole.MANAGER, UserRole.ADMIN]),
  });

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Format date
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

  // Handle export
  const handleExport = () => {
    // Redirect to the export endpoint with status filter
    const exportUrl = exportStatus === "all" 
      ? '/api/reports/export/expenses' 
      : `/api/reports/export/expenses?status=${exportStatus}`;
    
    window.open(exportUrl, '_blank');
    
    toast({
      title: "Export Started",
      description: "Your expense data is being downloaded as a CSV file.",
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
    if (action.includes('USER')) {
      return { icon: 'person', color: 'text-primary-main' };
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
    <MainLayout title="Reports">
      <div className="md:flex md:items-center md:justify-between pb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-medium leading-7 text-neutral-dark">Reports & Analytics</h2>
          <p className="mt-1 text-sm text-neutral-main">View activity logs and export expense data</p>
        </div>
      </div>

      <Tabs defaultValue="activity" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>Recent actions performed in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                // Loading state
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="border-b pb-4">
                      <div className="flex items-start">
                        <Skeleton className="h-6 w-6 mr-4" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !auditLogs || (auditLogs as AuditLog[]).length === 0 ? (
                // Empty state
                <div className="text-center py-12">
                  <span className="material-icons text-4xl text-neutral-main mb-2">history</span>
                  <h3 className="text-lg font-medium text-neutral-dark">No activity logs found</h3>
                  <p className="text-neutral-main mt-1">
                    Activity will appear here as users interact with the system
                  </p>
                </div>
              ) : (
                // Activity log list
                <div className="space-y-4">
                  {(auditLogs as AuditLog[]).map((log) => {
                    const { icon, color } = getActivityIcon(log.action);
                    
                    return (
                      <div key={log.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            <span className={`material-icons ${color}`}>{icon}</span>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm text-neutral-dark">
                              {formatActivityMessage(log)}
                            </p>
                            <p className="mt-1 text-sm text-neutral-main">
                              {formatDate(log.createdAt)}
                            </p>
                            {log.expenseId && (
                              <Button 
                                variant="link" 
                                className="p-0 h-auto text-sm text-primary hover:text-primary-dark mt-1"
                                onClick={() => navigate(`/expenses/${log.expenseId}`)}
                              >
                                View expense details
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="export" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Expense Data</CardTitle>
              <CardDescription>Download expense data as a CSV file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-neutral-dark mb-2">Filter by Status</h3>
                  <Select 
                    value={exportStatus} 
                    onValueChange={(value) => setExportStatus(value as ExpenseStatus | "all")}
                  >
                    <SelectTrigger className="w-full sm:w-72">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value={ExpenseStatus.PENDING}>Pending</SelectItem>
                      <SelectItem value={ExpenseStatus.APPROVED}>Approved</SelectItem>
                      <SelectItem value={ExpenseStatus.REJECTED}>Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="bg-neutral-light p-4 rounded-md">
                  <h3 className="text-sm font-medium text-neutral-dark mb-2">Export Details</h3>
                  <ul className="text-sm text-neutral-main space-y-2">
                    <li className="flex items-center">
                      <span className="material-icons text-sm mr-2">check</span>
                      Expense ID, Amount, Category
                    </li>
                    <li className="flex items-center">
                      <span className="material-icons text-sm mr-2">check</span>
                      Submission Date, Status
                    </li>
                    <li className="flex items-center">
                      <span className="material-icons text-sm mr-2">check</span>
                      Submitter Name and Details
                    </li>
                    <li className="flex items-center">
                      <span className="material-icons text-sm mr-2">check</span>
                      Description and Notes
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleExport}
                className="bg-primary hover:bg-primary-dark text-white"
              >
                <span className="material-icons text-sm mr-2">file_download</span>
                Export as CSV
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
