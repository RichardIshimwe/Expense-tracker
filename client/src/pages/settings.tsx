import { useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ui/theme-provider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [autoExport, setAutoExport] = useState(false);
  
  const handleSaveNotifications = () => {
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };
  
  const handleSaveAppearance = () => {
    toast({
      title: "Appearance Updated",
      description: "Your theme preferences have been saved.",
    });
  };

  return (
    <MainLayout title="Settings">
      <div className="md:flex md:items-center md:justify-between pb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-medium leading-7 text-neutral-dark">Settings</h2>
          <p className="mt-1 text-sm text-neutral-main">Manage your account preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                  <span className="text-sm">{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-dark">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-neutral-main">{user?.email}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-neutral-dark">Username</p>
                <p className="text-sm text-neutral-main">{user?.username}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-neutral-dark">Role</p>
                <p className="text-sm text-neutral-main capitalize">{user?.role}</p>
              </div>
              
              <Separator />
              
              <div>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Not Implemented",
                      description: "This feature would allow you to edit your profile information.",
                    });
                  }}
                >
                  <span className="material-icons text-sm mr-2">edit</span>
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Notifications Card */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="text-sm font-medium text-neutral-dark">Email Notifications</Label>
                  <p className="text-xs text-neutral-main">Receive updates about your expenses via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="browser-notifications" className="text-sm font-medium text-neutral-dark">Browser Notifications</Label>
                  <p className="text-xs text-neutral-main">Receive real-time alerts in your browser</p>
                </div>
                <Switch
                  id="browser-notifications"
                  checked={browserNotifications}
                  onCheckedChange={setBrowserNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-export" className="text-sm font-medium text-neutral-dark">Automatic Exports</Label>
                  <p className="text-xs text-neutral-main">Automatically export monthly expense reports</p>
                </div>
                <Switch
                  id="auto-export"
                  checked={autoExport}
                  onCheckedChange={setAutoExport}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="bg-primary hover:bg-primary-dark text-white"
              onClick={handleSaveNotifications}
            >
              Save Preferences
            </Button>
          </CardFooter>
        </Card>
        
        {/* Appearance Card */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the application looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-neutral-dark">Theme</Label>
                <RadioGroup 
                  value={theme} 
                  onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label htmlFor="theme-system">System</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="bg-primary hover:bg-primary-dark text-white"
              onClick={handleSaveAppearance}
            >
              Save Appearance
            </Button>
          </CardFooter>
        </Card>
        
        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Not Implemented",
                      description: "This feature would allow you to change your password.",
                    });
                  }}
                >
                  <span className="material-icons text-sm mr-2">lock</span>
                  Change Password
                </Button>
              </div>
              
              <div>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Not Implemented",
                      description: "This feature would enable two-factor authentication.",
                    });
                  }}
                >
                  <span className="material-icons text-sm mr-2">security</span>
                  Enable Two-Factor Authentication
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-neutral-dark">Session Information</p>
                <p className="text-xs text-neutral-main">Last login: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
