import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ExpenseStatus } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface RejectFormModalProps {
  expenseId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const rejectFormSchema = z.object({
  comment: z.string().min(1, "Please provide a reason for rejection"),
});

type RejectFormValues = z.infer<typeof rejectFormSchema>;

export function RejectFormModal({ expenseId, onClose, onSuccess }: RejectFormModalProps) {
  const [open, setOpen] = useState(true);
  const { toast } = useToast();
  
  const form = useForm<RejectFormValues>({
    resolver: zodResolver(rejectFormSchema),
    defaultValues: {
      comment: "",
    },
  });

  // Reject expense mutation
  const rejectMutation = useMutation({
    mutationFn: async (values: RejectFormValues) => {
      await apiRequest(
        'PATCH',
        `/api/expenses/${expenseId}/status`,
        { 
          status: ExpenseStatus.REJECTED,
          comment: values.comment
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Expense Rejected",
        description: "The expense has been rejected and the employee has been notified.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject expense",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300); // Allow animation to complete
  };

  const onSubmit = (values: RejectFormValues) => {
    rejectMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="material-icons text-error-main">warning</span>
            Reject Expense
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mt-2">
              <p className="text-sm text-neutral-main">
                Please provide a reason for rejecting this expense. This information will be sent to the employee.
              </p>
            </div>
            
            <div className="mt-4">
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Rejection</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Please explain why this expense is being rejected"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="mt-4">
              <Button
                type="submit"
                variant="destructive"
                className="w-full bg-error-main hover:bg-error-dark sm:ml-3 sm:w-auto"
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="mt-3 w-full sm:mt-0 sm:w-auto"
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
