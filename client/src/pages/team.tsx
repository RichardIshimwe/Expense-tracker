import { useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { User, UserRole } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

export default function TeamPage() {
  const { hasAnyRole } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [searchQuery, setSearchQuery] = useState("");

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

  // Fetch team members
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['/api/users/team'],
    enabled: hasAnyRole([UserRole.MANAGER, UserRole.ADMIN]),
  });

  // Filter users based on search query
  const filteredUsers = teamMembers 
    ? (teamMembers as User[]).filter(user => {
        const searchFields = [
          user.firstName,
          user.lastName,
          user.email,
          user.username,
          user.role
        ].join(' ').toLowerCase();
        
        return searchQuery.trim() === '' || searchFields.includes(searchQuery.toLowerCase());
      })
    : [];

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Role display name mapping
  const roleDisplayNames = {
    [UserRole.EMPLOYEE]: "Employee",
    [UserRole.MANAGER]: "Manager",
    [UserRole.ADMIN]: "Administrator"
  };

  return (
    <MainLayout title="Team Members">
      <div className="md:flex md:items-center md:justify-between pb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-medium leading-7 text-neutral-dark">Team Members</h2>
          <p className="mt-1 text-sm text-neutral-main">View and manage your team</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Team Directory</CardTitle>
              <CardDescription>
                Members of your team who can submit expenses
              </CardDescription>
            </div>
            <div className="mt-4 sm:mt-0 relative flex items-center">
              <Input
                type="text"
                className="shadow-sm focus:ring-primary focus:border-primary pr-10 w-full sm:w-64"
                placeholder="Search members"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="material-icons text-neutral-main">search</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            // Loading state
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="p-4 border rounded-md">
                  <div className="flex items-center">
                    <Skeleton className="h-12 w-12 rounded-full mr-4" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <span className="material-icons text-4xl text-neutral-main mb-2">people</span>
              <h3 className="text-lg font-medium text-neutral-dark">No team members found</h3>
              <p className="text-neutral-main mt-1">
                {searchQuery ? "Try a different search term" : "Add team members to get started"}
              </p>
            </div>
          ) : (
            // User list
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user: User) => (
                <div key={user.id} className="p-4 border rounded-md hover:bg-neutral-light transition-colors">
                  <div className="flex items-start">
                    <UserAvatar user={user} className="h-12 w-12" />
                    <div className="ml-4">
                      <h4 className="font-medium text-neutral-dark">
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className="text-sm text-neutral-main">{user.email}</p>
                      <div className="flex items-center mt-2">
                        <span className="text-xs font-medium bg-neutral-light text-neutral-dark rounded-full px-2 py-1">
                          {roleDisplayNames[user.role as UserRole]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
