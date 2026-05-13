import { useAuth } from "@/hooks/useAuth";

export function usePremiumAccess() {
  const { user } = useAuth();
  const tier = (user as { subscriptionTier?: string } | null | undefined)?.subscriptionTier;
  const isPro = tier === "premium" || tier === "pro" || tier === "enterprise";
  const gateHref = (target: string) => (isPro ? target : "/subscription");
  return { isPro, gateHref };
}
