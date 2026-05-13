import { useQuery } from "@tanstack/react-query";
import type { EffectivePlan } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export function useSubscription() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useQuery<EffectivePlan>({
    queryKey: ["/api/subscription"],
    enabled: isAuthenticated,
    retry: false,
  });

  const plan: EffectivePlan = data ?? {
    tier: 0,
    tierName: "Basic",
    status: "active",
    isPro: false,
    isTrialing: false,
    trialDaysLeft: null,
    trialEndsAt: null,
    nextBillingDate: null,
    willCancel: false,
    provider: null,
  };

  return { plan, isLoading };
}
