import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export type UnitSystem = "metric" | "imperial";

export interface UserPreferences {
  theme?: "dark" | "light";
  units?: UnitSystem;
  language?: string;
  pushNotifications?: boolean;
  emailUpdates?: boolean;
  autoSave?: boolean;
}

const PREFS_LOCAL_KEY_PREFIX = "arcside-prefs-cache:";
const ANON_KEY = `${PREFS_LOCAL_KEY_PREFIX}anonymous`;

function cacheKeyFor(userId: string | undefined): string {
  return userId ? `${PREFS_LOCAL_KEY_PREFIX}${userId}` : ANON_KEY;
}

function readLocalCache(key: string): UserPreferences {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLocalCache(key: string, prefs: UserPreferences) {
  try {
    localStorage.setItem(key, JSON.stringify(prefs));
  } catch {}
}

export function useUserPreferences() {
  const { user, isAuthenticated } = useAuth();
  const userId = (user as any)?.id as string | undefined;
  const remote = ((user as any)?.preferences || {}) as UserPreferences;
  const cacheKey = cacheKeyFor(userId);
  const local = readLocalCache(cacheKey);

  const merged: UserPreferences = {
    theme: remote.theme ?? local.theme ?? "dark",
    units: remote.units ?? local.units ?? "metric",
    language: remote.language ?? local.language ?? "english",
    pushNotifications: remote.pushNotifications ?? local.pushNotifications ?? true,
    emailUpdates: remote.emailUpdates ?? local.emailUpdates ?? true,
    autoSave: remote.autoSave ?? local.autoSave ?? true,
  };

  // Hydrate the per-user cache once per session.
  const hydratedForUserRef = useRef<string | null>(null);
  useEffect(() => {
    if (!userId) return;
    if (hydratedForUserRef.current === userId) return;
    if (Object.keys(remote).length > 0) {
      writeLocalCache(cacheKey, { ...local, ...remote });
    }
    hydratedForUserRef.current = userId;
  }, [userId, remote, cacheKey]);

  const mutation = useMutation({
    mutationFn: (patch: Partial<UserPreferences>) =>
      apiRequest("PUT", "/api/user/preferences", patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const setPreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    const next = { ...merged, [key]: value };
    writeLocalCache(cacheKey, next);
    if (isAuthenticated) {
      mutation.mutate({ [key]: value } as Partial<UserPreferences>);
    }
  };

  return { preferences: merged, setPreference, isSaving: mutation.isPending };
}
