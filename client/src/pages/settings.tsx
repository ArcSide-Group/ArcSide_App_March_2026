import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function Settings() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const handleSignOut = () => {
    window.location.href = '/api/logout';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="text-primary-foreground font-bold text-xl">A</div>
          </div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Professional';
  const userEmail = user?.email || 'professional@arcside.app';

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full bg-secondary/50">
                <i className="fas fa-arrow-left text-sm"></i>
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Settings</h1>
              <p className="text-xs text-muted-foreground">Customize your experience</p>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="px-6 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-primary flex items-center justify-center">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-16 h-16 object-cover"
                    />
                  ) : (
                    <i className="fas fa-user text-primary-foreground text-xl"></i>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{userName}</h3>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.certifications || 'CWI, AWS D1.1 Certified'}
                  </p>
                </div>
                <Button variant="link" size="sm" className="text-primary p-0">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Groups */}
        <div className="px-6 mb-6 space-y-6">
          
          {/* Preferences */}
          <div>
            <h3 className="font-semibold mb-3">Preferences</h3>
            <Card className="bg-card border-border">
              <CardContent className="p-1">
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-moon text-muted-foreground"></i>
                    <span className="text-sm">Dark Mode</span>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                    data-testid="switch-dark-mode"
                  />
                </div>
                <div className="border-t border-border"></div>
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-bell text-muted-foreground"></i>
                    <span className="text-sm">Push Notifications</span>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                    data-testid="switch-notifications"
                  />
                </div>
                <div className="border-t border-border"></div>
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-globe text-muted-foreground"></i>
                    <span className="text-sm">Units</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Imperial</span>
                    <i className="fas fa-chevron-right text-muted-foreground text-xs"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Settings */}
          <div>
            <h3 className="font-semibold mb-3">AI Assistant</h3>
            <Card className="bg-card border-border">
              <CardContent className="p-1">
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-robot text-muted-foreground"></i>
                    <span className="text-sm">AI Response Detail</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Detailed</span>
                    <i className="fas fa-chevron-right text-muted-foreground text-xs"></i>
                  </div>
                </div>
                <div className="border-t border-border"></div>
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-book text-muted-foreground"></i>
                    <span className="text-sm">Preferred Standards</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">AWS D1.1</span>
                    <i className="fas fa-chevron-right text-muted-foreground text-xs"></i>
                  </div>
                </div>
                <div className="border-t border-border"></div>
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-save text-muted-foreground"></i>
                    <span className="text-sm">Auto-save Analyses</span>
                  </div>
                  <Switch
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                    data-testid="switch-auto-save"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-3">Support</h3>
            <Card className="bg-card border-border">
              <CardContent className="p-1">
                <button className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary/20 transition-colors rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-question-circle text-muted-foreground"></i>
                    <span className="text-sm">Help Center</span>
                  </div>
                  <i className="fas fa-chevron-right text-muted-foreground text-xs"></i>
                </button>
                <div className="border-t border-border"></div>
                <button className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary/20 transition-colors rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-envelope text-muted-foreground"></i>
                    <span className="text-sm">Contact Support</span>
                  </div>
                  <i className="fas fa-chevron-right text-muted-foreground text-xs"></i>
                </button>
                <div className="border-t border-border"></div>
                <button className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary/20 transition-colors rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-star text-muted-foreground"></i>
                    <span className="text-sm">Rate App</span>
                  </div>
                  <i className="fas fa-chevron-right text-muted-foreground text-xs"></i>
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold mb-3">Account</h3>
            <Card className="bg-card border-border">
              <CardContent className="p-1">
                <button className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary/20 transition-colors rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-shield-alt text-muted-foreground"></i>
                    <span className="text-sm">Privacy Policy</span>
                  </div>
                  <i className="fas fa-chevron-right text-muted-foreground text-xs"></i>
                </button>
                <div className="border-t border-border"></div>
                <button className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary/20 transition-colors rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-file-contract text-muted-foreground"></i>
                    <span className="text-sm">Terms of Service</span>
                  </div>
                  <i className="fas fa-chevron-right text-muted-foreground text-xs"></i>
                </button>
                <div className="border-t border-border"></div>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-destructive/10 transition-colors rounded-lg"
                  data-testid="button-sign-out"
                >
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-sign-out-alt text-destructive"></i>
                    <span className="text-sm text-destructive">Sign Out</span>
                  </div>
                  <i className="fas fa-chevron-right text-muted-foreground text-xs"></i>
                </button>
              </CardContent>
            </Card>
          </div>

          {/* App Info */}
          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">ArcSide™ v2.1.0</p>
            <p className="text-xs text-muted-foreground">The App Made by Tradesmen for Tradesmen</p>
          </div>
        </div>
      </div>
    </div>
  );
}
