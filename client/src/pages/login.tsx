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
        <LoginForm />
      </div>
    </div>
  );
}
