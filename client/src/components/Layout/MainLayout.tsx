import { useEffect } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const { isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && location !== "/login") {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [isAuthenticated, location, navigate, toast]);

  // If not authenticated, don't render the layout
  if (!isAuthenticated && location !== "/login") {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-light">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden px-2 text-neutral-dark"
                    onClick={() => {
                      // This would be expanded to show a mobile sidebar in a real implementation
                      toast({
                        title: "Mobile navigation",
                        description: "Mobile sidebar would open here",
                      });
                    }}
                  >
                    <span className="material-icons">menu</span>
                  </Button>
                )}
                <h1 className="text-lg font-medium ml-2 md:ml-0">{title}</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="p-1 text-neutral-main hover:text-neutral-dark">
                  <span className="material-icons">notifications</span>
                </Button>
                <Button variant="ghost" size="icon" className="p-1 text-neutral-main hover:text-neutral-dark">
                  <span className="material-icons">help_outline</span>
                </Button>
                <div className="md:hidden">
                  <Button variant="ghost" size="icon" className="p-1 text-neutral-main hover:text-neutral-dark">
                    <span className="material-icons">account_circle</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-neutral-light">
          <div className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
