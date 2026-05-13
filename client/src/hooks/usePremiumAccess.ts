import { useSubscription } from "@/hooks/useSubscription";

export function usePremiumAccess() {
  const { plan } = useSubscription();
  const isPro = plan.isPro;
  const gateHref = (target: string) => (isPro ? target : "/subscription");
  return { isPro, gateHref, plan };
}
