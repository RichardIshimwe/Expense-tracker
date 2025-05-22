import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ExpenseCategory, UserRole } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewExpenseModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const expenseFormSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Amount must be a positive number"),
  category: z.nativeEnum(ExpenseCategory, {
    errorMap: () => ({ message: "Please select a category" }),
  }),
  description: z.string().min(1, "Description is required"),
  receipt: z.any()
    .refine(val => val instanceof FileList || (val instanceof File), "Invoice must be a file")
    .refine(val => val instanceof FileList ? val.length > 0 : true, "Invoice is required")
    .transform(val => val instanceof FileList ? val[0] : val),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export function NewExpenseModal({ onClose, onSuccess }: NewExpenseModalProps) {
  const [open, setOpen] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: "",
      description: "",
    },
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (values: ExpenseFormValues) => {
      const formData = new FormData();
      formData.append("amount", values.amount);
      formData.append("category", values.category);
      formData.append("description", values.description);
      formData.append("receipt", values.receipt);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create expense");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Expense Created",
        description: "Your expense has been successfully submitted for approval.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/expenses/my-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses/stats/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reports/activity-logs'] });
      
      if (onSuccess) {
        onSuccess();
      }
      
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create expense",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300); // Allow animation to complete
  };

  const onSubmit = (values: ExpenseFormValues) => {
    createExpenseMutation.mutate(values);
  };

  // Preview image after selection
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit New Expense</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="sm:col-span-3">
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="sm:col-span-3">
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ExpenseCategory.TRAVEL}>Travel</SelectItem>
                        <SelectItem value={ExpenseCategory.MEALS}>Meals & Entertainment</SelectItem>
                        <SelectItem value={ExpenseCategory.OFFICE}>Office Supplies</SelectItem>
                        <SelectItem value={ExpenseCategory.CONFERENCE}>Conferences</SelectItem>
                        <SelectItem value={ExpenseCategory.SOFTWARE}>Software</SelectItem>
                        <SelectItem value={ExpenseCategory.OTHER}>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="sm:col-span-6">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Provide details about this expense"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="receipt"
                render={({ field: { onChange, value, ...fieldProps } }) => (
                  <FormItem className="sm:col-span-6">
                    <FormLabel>Invoice</FormLabel>
                    <FormControl>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {previewUrl ? (
                            <div className="mb-3">
                              <img 
                                src={previewUrl} 
                                alt="Invoice preview" 
                                className="mx-auto h-32 object-cover rounded-md"
                              />
                            </div>
                          ) : (
                            <span className="material-icons text-neutral-main mx-auto">cloud_upload</span>
                          )}
                          <div className="flex text-sm text-neutral-main justify-center">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                              <span>Upload a file</span>
                              <Input
                                {...fieldProps}
                                id="receipt-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={(e) => {
                                  onChange(e.target.files);
                                  handleFileChange(e);
                                }}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-neutral-main">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="mt-6">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white sm:ml-3 sm:w-auto"
                disabled={createExpenseMutation.isPending}
              >
                {createExpenseMutation.isPending ? "Submitting..." : "Submit Expense"}
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
