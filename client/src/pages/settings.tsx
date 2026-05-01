
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useUnits } from "@/hooks/useUnits";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useBrand } from "@/hooks/useBrand";
import { useTranslation } from "@/lib/i18n";
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
} from "lucide-react";
import logoPath from "@assets/image_1773535782481(2)_1774714538260.jpg";

export default function Settings() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { units, setUnits } = useUnits();
  const { preferences, setPreference } = useUserPreferences();
  const { brand } = useBrand();
  const { t } = useTranslation();
  const pushNotifications = preferences.pushNotifications ?? true;
  const emailUpdates = preferences.emailUpdates ?? true;
  const autoSave = preferences.autoSave ?? true;
  const language = preferences.language ?? "english";
  const isArcside = brand.id === "arcside";

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="max-w-sm mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{t("settings.title")}</h1>
          <p className="text-muted-foreground">
            {t("settings.subtitle")}
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
                {t("settings.notifications")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 pr-4">
                    <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <h4 className="font-medium text-sm">{t("settings.pushNotifications")}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{t("settings.pushNotificationsDesc")}</p>
                    </div>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={(v) => setPreference("pushNotifications", v)}
                    data-testid="switch-push-notifications"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 pr-4">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <h4 className="font-medium text-sm">{t("settings.emailUpdates")}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{t("settings.emailUpdatesDesc")}</p>
                    </div>
                  </div>
                  <Switch
                    checked={emailUpdates}
                    onCheckedChange={(v) => setPreference("emailUpdates", v)}
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
                {t("settings.appearance")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 pr-4">
                    {isDark ? <Moon className="h-4 w-4 text-muted-foreground shrink-0" /> : <Sun className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <div>
                      <h4 className="font-medium text-sm">{t("settings.darkMode")}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isDark ? t("settings.darkOn") : t("settings.darkOff")}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isDark}
                    onCheckedChange={toggleTheme}
                    data-testid="switch-dark-mode"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-primary" />
                {t("settings.preferences")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-sm">{t("settings.units")}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t("settings.unitsDesc")}</p>
                  </div>
                  <Select value={units} onValueChange={(v) => setUnits(v as 'imperial' | 'metric')}>
                    <SelectTrigger className="w-32" data-testid="select-units">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imperial">{t("settings.imperial")}</SelectItem>
                      <SelectItem value="metric">{t("settings.metric")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-sm">{t("settings.language")}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t("settings.languageDesc")}</p>
                  </div>
                  <Select value={language} onValueChange={(v) => setPreference("language", v)}>
                    <SelectTrigger className="w-32" data-testid="select-language">
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
                    <h4 className="font-medium text-sm">{t("settings.autoSave")}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t("settings.autoSaveDesc")}</p>
                  </div>
                  <Switch checked={autoSave} onCheckedChange={(v) => setPreference("autoSave", v)} data-testid="switch-auto-save" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                {t("settings.privacy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-sm">{t("settings.changePassword")}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t("settings.changePasswordDesc")}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Lock className="h-4 w-4 mr-2" />
                    Change
                  </Button>
                </div>
                <Separator />
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-sm">{t("settings.twoFactor")}</h4>
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-2fa-description">
                      {t("settings.twoFactorDesc")}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0 mt-0.5">Google OAuth</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-sm">{t("settings.exportData")}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t("settings.exportDataDesc")}</p>
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
              <a href="mailto:info@arcside.co.za" data-testid="link-contact-email">
                <Button variant="outline" className="w-full justify-start" type="button">
                  <Mail className="h-4 w-4 mr-2" />
                  info@arcside.co.za
                </Button>
              </a>
              <a href="tel:+27796819319" data-testid="link-contact-phone">
                <Button variant="outline" className="w-full justify-start" type="button">
                  <i className="fas fa-phone h-4 w-4 mr-2 text-sm"></i>
                  +27 79 681 9319
                </Button>
              </a>
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
              About {brand.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-3 py-2">
              <img
                src={brand.logo || logoPath}
                alt={brand.name}
                className="h-14 w-auto max-w-[180px] object-contain rounded-lg"
                data-testid="img-brand-logo-settings"
              />
              <div className="text-center">
                <h3 className="font-bold text-base text-foreground" data-testid="text-about-name">
                  {brand.name}
                  {isArcside ? <>&trade;</> : null}
                </h3>
                {brand.version && (
                  <p className="text-xs text-muted-foreground mt-0.5" data-testid="text-about-version">
                    {brand.version}
                  </p>
                )}
                {brand.description && (
                  <p
                    className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-line"
                    data-testid="text-about-description"
                  >
                    {brand.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">{t("settings.dangerZone")}</CardTitle>
            <CardDescription>{t("settings.dangerZoneDesc")}</CardDescription>
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
                {t("settings.signOut")}
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10">
                {t("settings.deleteAccount")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
