
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
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
  Lock
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [units, setUnits] = useState("metric");
  const [language, setLanguage] = useState("english");

  const settingSections = [
    {
      title: "Profile Settings",
      icon: User,
      items: [
        {
          title: "Profile Information",
          description: "Update your personal information and profile picture",
          component: (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#4CAF50]/20 rounded-full flex items-center justify-center">
                  <Camera className="h-6 w-6 text-[#4CAF50]" />
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
          )
        }
      ]
    },
    {
      title: "Notifications",
      icon: Bell,
      items: [
        {
          title: "Push Notifications",
          description: "Receive notifications about project updates and new features",
          component: (
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          )
        },
        {
          title: "Email Notifications",
          description: "Get important updates via email",
          component: (
            <Switch defaultChecked />
          )
        },
        {
          title: "Project Reminders",
          description: "Remind me about project deadlines",
          component: (
            <Switch defaultChecked />
          )
        }
      ]
    },
    {
      title: "Appearance",
      icon: Palette,
      items: [
        {
          title: "Dark Mode",
          description: "Toggle between light and dark themes",
          component: (
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          )
        },
        {
          title: "Color Theme",
          description: "Choose your preferred color scheme",
          component: (
            <Select defaultValue="green">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
              </SelectContent>
            </Select>
          )
        }
      ]
    },
    {
      title: "Preferences",
      icon: Globe,
      items: [
        {
          title: "Measurement Units",
          description: "Choose your preferred measurement system",
          component: (
            <Select value={units} onValueChange={setUnits}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric</SelectItem>
                <SelectItem value="imperial">Imperial</SelectItem>
              </SelectContent>
            </Select>
          )
        },
        {
          title: "Language",
          description: "Select your preferred language",
          component: (
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
          )
        },
        {
          title: "Auto-save Projects",
          description: "Automatically save project changes",
          component: (
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
          )
        }
      ]
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      items: [
        {
          title: "Change Password",
          description: "Update your account password",
          component: (
            <Button variant="outline" size="sm">
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          )
        },
        {
          title: "Two-Factor Authentication",
          description: "Add an extra layer of security",
          component: (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                Not Enabled
              </Badge>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
          )
        },
        {
          title: "Data Export",
          description: "Download your data and projects",
          component: (
            <Button variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          )
        }
      ]
    }
  ];

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
        <Card className="mb-6 bg-gradient-to-r from-[#4CAF50]/10 to-blue-500/10 border-[#4CAF50]/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#4CAF50] rounded-full flex items-center justify-center">
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

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingSections.map((section, sectionIndex) => (
            <Card key={sectionIndex}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <section.icon className="h-5 w-5 text-[#4CAF50]" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 pr-4">
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {item.component}
                        </div>
                      </div>
                      {itemIndex < section.items.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Support & Help */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HelpCircle className="h-5 w-5 text-[#4CAF50]" />
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
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="mt-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
