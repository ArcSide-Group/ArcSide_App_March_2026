
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useUnits } from "@/hooks/useUnits";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database, 
  HelpCircle,
  LogOut,
  Camera,
  Mail,
  Lock,
  Sun,
  Moon,
  Info
} from "lucide-react";
import logoPath from "@assets/image_1773535782481(2)_1774714538260.jpg";

export default function Settings() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { units, setUnits } = useUnits();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [language, setLanguage] = useState("english");

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="max-w-sm mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and application settings
          </p>
        </div>

        {/* Account Overview */}
        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{user?.firstName} {user?.lastName}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {user?.subscriptionTier === 'premium' ? 'Premium' : 'Free'} Plan
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">

          {/* Profile Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <Button variant="outline" size="sm">Change Photo</Button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue={user?.firstName || ""} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue={user?.lastName || ""} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email || ""} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-sm">Push Notifications</h4>
                    <p className="text-xs text-muted-foreground mt-1">Receive notifications about project updates</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-sm">Email Notifications</h4>
                    <p className="text-xs text-muted-foreground mt-1">Get important updates via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-sm">Project Reminders</h4>
                    <p className="text-xs text-muted-foreground mt-1">Remind me about project deadlines</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5 text-primary" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      {isDark ? "Dark Mode" : "Light Mode"}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isDark ? "Currently using dark theme" : "Currently using light theme"}
                    </p>
                  </div>
                  <Switch checked={isDark} onCheckedChange={toggleTheme} data-testid="switch-dark-mode" />
                </div>
                <Separator />
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex gap-2 mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-primary"></div>
                    <div className="w-4 h-4 rounded-full bg-accent"></div>
                  </div>
                  <div>
                    <p className="text-xs font-medium">ArcSide Royal Blue</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Brand colors matched to logo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-primary" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-sm">Measurement Units</h4>
                    <p className="text-xs text-muted-foreground mt-1">Choose your preferred measurement system</p>
                  </div>
                  <Select value={units} onValueChange={(v) => setUnits(v as 'imperial' | 'metric')}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imperial">Imperial</SelectItem>
                      <SelectItem value="metric">Metric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-sm">Language</h4>
                    <p className="text-xs text-muted-foreground mt-1">Select your preferred language</p>
                  </div>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-sm">Auto-save Projects</h4>
                    <p className="text-xs text-muted-foreground mt-1">Automatically save project changes</p>
                  </div>
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-sm">Change Password</h4>
                    <p className="text-xs text-muted-foreground mt-1">Update your account password</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Lock className="h-4 w-4 mr-2" />
                    Change
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-sm">Two-Factor Auth</h4>
                    <p className="text-xs text-muted-foreground mt-1">Add an extra layer of security</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-200 text-xs">Off</Badge>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-sm">Export Data</h4>
                    <p className="text-xs text-muted-foreground mt-1">Download your data and projects</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Database className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support & Help */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HelpCircle className="h-5 w-5 text-primary" />
              Support & Help
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help Center
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Give Feedback
              </Button>
              <Link href="/disclaimer" className="block">
                <Button variant="outline" className="w-full justify-start text-accent border-accent/30 hover:bg-accent/10">
                  <i className="fas fa-shield-alt h-4 w-4 mr-2"></i>
                  Liability Disclaimer
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-primary" />
              About ArcSide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-3 py-2">
              <img
                src={logoPath}
                alt="ArcSide Mobile App"
                className="h-12 w-auto object-contain rounded-lg"
                data-testid="img-arcside-logo-settings"
              />
              <div className="text-center">
                <h3 className="font-bold text-base text-foreground">ArcSide™ Professional</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Mobile App v1.0.0</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  AI-powered welding &amp; fabrication assistant.<br />
                  Built by tradesmen, for tradesmen.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="mt-6 border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => window.location.href = "/api/logout"}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
