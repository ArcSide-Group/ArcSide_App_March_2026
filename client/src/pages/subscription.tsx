import { useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star, Clock, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  PRO_FIRST_CHARGE_ZAR,
  PRO_RECURRING_ZAR,
  PROMO_USER_LIMIT,
  TRIAL_DURATION_HOURS,
  formatZar,
  formatDateSast,
} from "@shared/pricing";

export default function Subscription() {
  const { plan, isLoading } = useSubscription();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgrade") === "1") {
      toast({
        title: "Pro subscription required",
        description: "Start your 72-hour free trial to unlock the AI tools.",
      });
    }
  }, [toast]);

  const startTrial = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/billing/checkout/payfast");
      return (await res.json()) as { redirectUrl: string; mode: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      if (data?.redirectUrl) {
        toast({
          title: "Redirecting to PayFast",
          description: data.mode === "sandbox" ? "Sandbox checkout — no real charge." : undefined,
        });
        window.location.href = data.redirectUrl;
      } else {
        toast({ title: "Could not start checkout", variant: "destructive" });
      }
    },
    onError: () =>
      toast({
        title: "Could not start checkout",
        description: "Please try again in a moment.",
        variant: "destructive",
      }),
  });

  const cancelSub = useMutation({
    mutationFn: () => apiRequest("POST", "/api/subscription/cancel"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      toast({ title: "Cancellation scheduled", description: "You'll keep Pro access until the end of your paid period." });
    },
    onError: () => toast({ title: "Could not cancel", variant: "destructive" }),
  });

  const resumeSub = useMutation({
    mutationFn: () => apiRequest("POST", "/api/subscription/resume"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      toast({ title: "Subscription resumed", description: "Your billing will continue as normal." });
    },
    onError: () => toast({ title: "Could not resume", variant: "destructive" }),
  });

  const trialEnds = formatDateSast(plan.trialEndsAt);
  const nextBilling = formatDateSast(plan.nextBillingDate);

  const renderProCta = () => {
    if (plan.isTrialing) {
      const left = plan.trialDaysLeft ?? 0;
      return (
        <div className="space-y-2" data-testid="state-trialing">
          <div className="flex items-center justify-center gap-2 rounded-md bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-amber-600 dark:text-amber-400 text-xs">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Trial active — {left} day{left === 1 ? "" : "s"} left
              {trialEnds ? ` · ends ${trialEnds}` : ""}
            </span>
          </div>
          <Button
            variant="outline"
            className="w-full h-11"
            disabled={cancelSub.isPending || resumeSub.isPending}
            onClick={() => (plan.willCancel ? resumeSub.mutate() : cancelSub.mutate())}
            data-testid={plan.willCancel ? "button-resume" : "button-cancel"}
          >
            {plan.willCancel ? "Resume subscription" : "Cancel before first charge"}
          </Button>
        </div>
      );
    }

    if (plan.isPro) {
      return (
        <div className="space-y-2" data-testid="state-pro-active">
          <div className="text-xs text-muted-foreground text-center">
            {plan.willCancel
              ? `Access ends ${nextBilling ?? "at end of period"}`
              : `Next billing ${nextBilling ?? "—"}`}
          </div>
          <Button
            variant={plan.willCancel ? "default" : "outline"}
            className="w-full h-11"
            disabled={cancelSub.isPending || resumeSub.isPending}
            onClick={() => (plan.willCancel ? resumeSub.mutate() : cancelSub.mutate())}
            data-testid={plan.willCancel ? "button-resume" : "button-cancel"}
          >
            {plan.willCancel ? "Resume subscription" : "Cancel subscription"}
          </Button>
        </div>
      );
    }

    return (
      <Button
        className="w-full h-11 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
        disabled={startTrial.isPending || isLoading}
        onClick={() => startTrial.mutate()}
        data-testid="button-start-trial"
      >
        <Zap className="h-4 w-4 mr-2" />
        Start {TRIAL_DURATION_HOURS}-hour free trial
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-sm mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Crown className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1.5">Choose Your Plan</h1>
          <p className="text-sm text-muted-foreground">
            Unlock the full ArcSide™ Pro toolset for South African welders.
          </p>
        </div>

        <div
          className="mb-5 rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-start gap-2.5"
          data-testid="banner-promo"
        >
          <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold text-primary">Founder pricing:</span>{" "}
            {formatZar(PRO_FIRST_CHARGE_ZAR)} first month, then{" "}
            {formatZar(PRO_RECURRING_ZAR)}/month — first {PROMO_USER_LIMIT.toLocaleString("en-ZA")} users only.
          </div>
        </div>

        <div className="space-y-4">
          {/* Basic */}
          <Card className="border-border" data-testid="card-plan-basic">
            <CardHeader className="text-center pb-3 pt-6">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-secondary">
                  <Star className="h-6 w-6 text-secondary-foreground" />
                </div>
              </div>
              <CardTitle className="text-xl">Basic</CardTitle>
              <div className="flex items-baseline justify-center gap-1 mt-1">
                <span className="text-3xl font-bold">{formatZar(0)}</span>
                <span className="text-muted-foreground text-sm">/forever</span>
              </div>
              <CardDescription className="text-xs mt-1">
                Calculators and reference tools at no cost.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <ul className="space-y-2">
                {[
                  "All welding & fabrication calculators",
                  "Project organisation",
                  "Weld log entries",
                  "Beta feedback channel",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" disabled className="w-full h-11 font-semibold" data-testid="button-basic">
                {plan.tier === 0 ? "Current plan" : "Free tier"}
              </Button>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card
            className="relative border-primary shadow-lg ring-1 ring-primary/30"
            data-testid="card-plan-pro"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <Badge className="bg-primary text-primary-foreground px-4 py-1 font-semibold shadow">
                Most Popular
              </Badge>
            </div>
            <CardHeader className="text-center pb-3 pt-6">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/20">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl">Pro</CardTitle>
              <div className="flex items-baseline justify-center gap-1 mt-1">
                <span className="text-3xl font-bold" data-testid="text-pro-first-price">
                  {formatZar(PRO_FIRST_CHARGE_ZAR)}
                </span>
                <span className="text-muted-foreground text-sm">/first month</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5" data-testid="text-pro-recurring-price">
                then {formatZar(PRO_RECURRING_ZAR)}/month · cancel anytime
              </p>
              <CardDescription className="text-xs mt-2">
                For working welders and fabrication shops.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <ul className="space-y-2">
                {[
                  "AI Defect Analyzer with photo upload",
                  "WPS Generator (ISO 15614-1 / AWS D1.1)",
                  "Material Compatibility Checker",
                  "Welding Terminology Search",
                  "Weld Assistant chat",
                  "PDF export with watermark",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {renderProCta()}
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card className="border-accent/40" data-testid="card-plan-enterprise">
            <CardHeader className="text-center pb-3 pt-6">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent/20">
                  <Crown className="h-6 w-6 text-accent" />
                </div>
              </div>
              <CardTitle className="text-xl">Enterprise</CardTitle>
              <div className="flex items-baseline justify-center gap-1 mt-1">
                <span className="text-2xl font-bold">Custom</span>
              </div>
              <CardDescription className="text-xs mt-1">
                For training providers, large fabrication shops and OEMs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <ul className="space-y-2">
                {[
                  "Everything in Pro",
                  "Team seats & shared projects",
                  "Branded reports (white-label)",
                  "Priority phone & email support",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="mailto:info@arcside.co.za" data-testid="link-contact-sales">
                <Button className="w-full h-11 font-semibold bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Crown className="h-4 w-4 mr-2" />
                  Contact Sales
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-3 text-sm">Frequently Asked Questions</h3>
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <h4 className="font-medium mb-1 text-foreground">How does the trial work?</h4>
                <p className="text-muted-foreground">
                  You get full Pro access for {TRIAL_DURATION_HOURS} hours from the moment you start. Cancel any time before the
                  trial ends and you won't be charged.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-foreground">When am I charged?</h4>
                <p className="text-muted-foreground">
                  Your first {formatZar(PRO_FIRST_CHARGE_ZAR)} charge happens when the trial ends. After that, billing is{" "}
                  {formatZar(PRO_RECURRING_ZAR)}/month on the same date each cycle.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-foreground">What happens if I cancel?</h4>
                <p className="text-muted-foreground">
                  You keep Pro access until the end of your current paid period. No partial refunds. You can resume anytime
                  before access ends.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-foreground">Payment methods</h4>
                <p className="text-muted-foreground">
                  All major South African cards, EFT and Snapscan. Prices in ZAR.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
