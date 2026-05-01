import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { apiRequest, queryClient } from "@/lib/queryClient";

/**
 * Hydrates theme from user.preferences on first auth load,
 * then mirrors any subsequent local theme changes back to the server.
 * Mount inside the QueryClientProvider tree.
 */
export default function ThemeSync() {
  const { user, isAuthenticated } = useAuth();
  const { isDark, setIsDark } = useTheme();
  const userId = (user as any)?.id as string | undefined;
  const remoteTheme = ((user as any)?.preferences as any)?.theme as "dark" | "light" | undefined;
  const hydratedForUserRef = useRef<string | null>(null);

  // 1) First-time hydrate per user. If user has a remote theme, adopt it.
  // If they don't, mark hydrated so subsequent local toggles get persisted.
  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    if (hydratedForUserRef.current === userId) return;
    if (remoteTheme === "dark" || remoteTheme === "light") {
      setIsDark(remoteTheme === "dark");
    }
    hydratedForUserRef.current = userId;
  }, [isAuthenticated, userId, remoteTheme, setIsDark]);

  // 2) Reset hydration when the user logs out.
  useEffect(() => {
    if (!isAuthenticated) {
      hydratedForUserRef.current = null;
    }
  }, [isAuthenticated]);

  // 3) Persist subsequent changes back to DB.
  useEffect(() => {
    if (!isAuthenticated || hydratedForUserRef.current !== userId) return;
    const desired = isDark ? "dark" : "light";
    if (desired === remoteTheme) return;
    apiRequest("PUT", "/api/user/preferences", { theme: desired })
      .then(() => queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] }))
      .catch(() => {});
  }, [isDark, isAuthenticated, userId, remoteTheme]);

  return null;
}
