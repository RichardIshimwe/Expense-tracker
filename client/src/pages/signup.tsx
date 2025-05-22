import { SignupForm } from "@/components/AuthForms/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Expense<span className="text-primary">Track</span>
          </h1>
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Sign Up
          </h2>
          <p className="mt-2 text-sm text-neutral-main">
            Create a new account to join the expense management system
          </p>
        </div>
        
        <SignupForm />
      </div>
    </div>
  );
}