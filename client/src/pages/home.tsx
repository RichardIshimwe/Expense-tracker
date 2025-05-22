import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight, FileText, Users, PieChart, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (isAuthenticated === true) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="relative bg-primary text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              ExpenseTrack
            </h1>
            <p className="text-xl sm:text-2xl mb-8">
              Streamline your expense approval workflow with our comprehensive management system
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-md">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-md">
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Powerful Features</h2>
            <p className="mt-4 text-lg text-neutral-main max-w-2xl mx-auto">
              Our expense management system provides everything you need to streamline your expense approval process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Easy Expense Submission</CardTitle>
                <CardDescription>
                  Submit expenses with just a few clicks and upload invoices directly from your device
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Simple form submission</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Invoice upload</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Multiple expense categories</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Role-Based Access Control</CardTitle>
                <CardDescription>
                  Different roles for employees, managers, and administrators with appropriate permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Employee expense submission</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Manager approval workflows</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Admin system management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <PieChart className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Comprehensive Reporting</CardTitle>
                <CardDescription>
                  Generate detailed reports and export data for analysis and record-keeping
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Expense summaries</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Activity audit logs</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Data exports in CSV format</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
            <p className="mt-4 text-lg text-neutral-main max-w-2xl mx-auto">
              Our expense approval workflow is designed to be simple and efficient
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Submit</h3>
              <p className="text-neutral-main">
                Employees submit expenses with necessary details and invoice attachments
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Review</h3>
              <p className="text-neutral-main">
                Managers review submitted expenses and approve or reject with comments
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Process</h3>
              <p className="text-neutral-main">
                Approved expenses are processed for payment and tracked in the system
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to streamline your expense process?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of organizations that use ExpenseTrack to manage their expenses efficiently
          </p>
          <Button asChild size="lg" variant="secondary" className="text-md">
            <Link href="/signup">Get Started Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-8 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">
                Expense<span className="text-primary">Track</span>
              </h2>
              <p className="text-sm text-neutral-main">
                Expense approval workflow system &copy; {new Date().getFullYear()}
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="/login" className="text-neutral-main hover:text-primary">
                Login
              </Link>
              <Link href="/signup" className="text-neutral-main hover:text-primary">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}