
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Info,
  MessageSquare
} from "lucide-react";
import logoPath from "@assets/image_1773535782481(2)_1774714538260.jpg";

export default function Settings() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { units, setUnits } = useUnits();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [language, setLanguage] = useState("english");

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="max-w-sm mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and application settings
          </p>
        </div>

        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
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
                  <div className="flex items-center gap-3 flex-1 pr-4">
                    <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <h4 className="font-medium text-sm">Push Notifications</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Get notified about project updates</p>
                    </div>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                    data-testid="switch-push-notifications"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 pr-4">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <h4 className="font-medium text-sm">Email Updates</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Receive important updates via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={emailUpdates}
                    onCheckedChange={setEmailUpdates}
                    data-testid="switch-email-updates"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
                  <div className="flex items-center gap-3 flex-1 pr-4">
                    {isDark ? <Moon className="h-4 w-4 text-muted-foreground shrink-0" /> : <Sun className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <div>
                      <h4 className="font-medium text-sm">Dark Mode</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isDark ? "Currently using dark theme" : "Currently using light theme"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isDark}
                    onCheckedChange={toggleTheme}
                    data-testid="switch-dark-mode"
                  />
                </div>
                <Separator />
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex gap-2 mt-0.5">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#1e40af' }}></div>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#38bdf8' }}></div>
                  </div>
                  <div>
                    <p className="text-xs font-medium">ArcSide Royal Blue</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Brand colors matched to logo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                      <SelectItem value="afrikaans">Afrikaans</SelectItem>
                      <SelectItem value="zulu">Zulu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-sm">Auto-save Projects</h4>
                    <p className="text-xs text-muted-foreground mt-1">Automatically save project changes</p>
                  </div>
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} data-testid="switch-auto-save" />
                </div>
              </div>
            </CardContent>
          </Card>

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
              <Link href="/beta-feedback">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Give Feedback
                </Button>
              </Link>
              <Link href="/disclaimer">
                <Button variant="outline" className="w-full justify-start text-accent border-accent/30 hover:bg-accent/10">
                  <Shield className="h-4 w-4 mr-2" />
                  Liability Disclaimer
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

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
                data-testid="button-sign-out"
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
