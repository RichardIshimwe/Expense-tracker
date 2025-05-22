import { useEffect } from "react";
import { LoginForm } from "@/components/AuthForms/LoginForm";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Expense<span className="text-primary">Track</span>
          </h1>
          <h2 className="mt-4 text-2xl font-bold text-foreground">
            Sign In
          </h2>
          <p className="mt-2 text-sm text-neutral-main">
            Enter your credentials to access your account
          </p>
        </div>
        <LoginForm />
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-main">
            Don't have an account?{" "}
            <a href="/signup" className="text-primary hover:text-primary-dark font-medium">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
