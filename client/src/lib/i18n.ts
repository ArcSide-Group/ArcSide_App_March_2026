import { useUserPreferences } from "@/hooks/useUserPreferences";

export type Language = "english" | "afrikaans" | "zulu";

type Dict = Record<string, string>;

const en: Dict = {
  "nav.home": "Home",
  "nav.tools": "Tools",
  "nav.ai": "AI",
  "nav.settings": "Settings",
  "settings.title": "Settings",
  "settings.subtitle": "Manage your account preferences and application settings",
  "settings.notifications": "Notifications",
  "settings.pushNotifications": "Push Notifications",
  "settings.pushNotificationsDesc": "Get notified about project updates",
  "settings.emailUpdates": "Email Updates",
  "settings.emailUpdatesDesc": "Receive important updates via email",
  "settings.appearance": "Appearance",
  "settings.darkMode": "Dark Mode",
  "settings.darkOn": "Currently using dark theme",
  "settings.darkOff": "Currently using light theme",
  "settings.preferences": "Preferences",
  "settings.units": "Measurement Units",
  "settings.unitsDesc": "Choose your preferred measurement system",
  "settings.imperial": "Imperial",
  "settings.metric": "Metric",
  "settings.language": "Language",
  "settings.languageDesc": "Select your preferred language",
  "settings.autoSave": "Auto-save Projects",
  "settings.autoSaveDesc": "Automatically save project changes",
  "settings.privacy": "Privacy & Security",
  "settings.changePassword": "Change Password",
  "settings.changePasswordDesc": "Update your account password",
  "settings.exportData": "Export Data",
  "settings.exportDataDesc": "Download your data and projects",
  "settings.support": "Support & Help",
  "settings.helpCenter": "Help Center",
  "settings.disclaimer": "Liability Disclaimer",
  "settings.dangerZone": "Danger Zone",
  "settings.dangerZoneDesc": "Irreversible and destructive actions",
  "settings.signOut": "Sign Out",
  "settings.deleteAccount": "Delete Account",
};

const af: Dict = {
  "nav.home": "Tuis",
  "nav.tools": "Gereedskap",
  "nav.ai": "KI",
  "nav.settings": "Instellings",
  "settings.title": "Instellings",
  "settings.subtitle": "Bestuur jou rekeningvoorkeure en programinstellings",
  "settings.notifications": "Kennisgewings",
  "settings.pushNotifications": "Stootkennisgewings",
  "settings.pushNotificationsDesc": "Word in kennis gestel oor projekopdaterings",
  "settings.emailUpdates": "E-pos opdaterings",
  "settings.emailUpdatesDesc": "Ontvang belangrike opdaterings per e-pos",
  "settings.appearance": "Voorkoms",
  "settings.darkMode": "Donker modus",
  "settings.darkOn": "Tans donker tema in gebruik",
  "settings.darkOff": "Tans ligte tema in gebruik",
  "settings.preferences": "Voorkeure",
  "settings.units": "Maateenhede",
  "settings.unitsDesc": "Kies jou voorkeur maatstelsel",
  "settings.imperial": "Imperiaal",
  "settings.metric": "Metriek",
  "settings.language": "Taal",
  "settings.languageDesc": "Kies jou voorkeurtaal",
  "settings.autoSave": "Stoor projekte outomaties",
  "settings.autoSaveDesc": "Stoor projekveranderinge outomaties",
  "settings.privacy": "Privaatheid & Sekuriteit",
  "settings.changePassword": "Verander wagwoord",
  "settings.changePasswordDesc": "Werk jou rekening se wagwoord op",
  "settings.exportData": "Voer data uit",
  "settings.exportDataDesc": "Laai jou data en projekte af",
  "settings.support": "Ondersteuning & Hulp",
  "settings.helpCenter": "Hulpsentrum",
  "settings.disclaimer": "Aanspreeklikheidsverklaring",
  "settings.dangerZone": "Gevaarsone",
  "settings.dangerZoneDesc": "Onomkeerbare en vernietigende aksies",
  "settings.signOut": "Teken uit",
  "settings.deleteAccount": "Skrap rekening",
};

const zu: Dict = {
  "nav.home": "Ekhaya",
  "nav.tools": "Amathuluzi",
  "nav.ai": "I-AI",
  "nav.settings": "Izilungiselelo",
};

const DICTS: Record<Language, Dict> = {
  english: en,
  afrikaans: af,
  zulu: zu,
};

export function translate(language: Language, key: string): string {
  const lang = DICTS[language] ?? en;
  return lang[key] ?? en[key] ?? key;
}

export function useTranslation() {
  const { preferences } = useUserPreferences();
  const language = (preferences.language as Language) ?? "english";
  const t = (key: string) => translate(language, key);
  return { t, language };
}
