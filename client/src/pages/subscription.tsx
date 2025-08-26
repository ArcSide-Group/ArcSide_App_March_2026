import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";

export default function Subscription() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: usage } = useQuery({
    queryKey: ["/api/usage"],
    enabled: !!user,
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/subscription/upgrade', {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upgrade Successful",
        description: "Welcome to Premium! Enjoy unlimited access.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Upgrade Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="text-primary-foreground font-bold text-xl">A</div>
          </div>
          <p className="text-muted-foreground">Loading subscription...</p>
        </div>
      </div>
    );
  }

  const isPremium = user?.subscriptionTier === 'premium';

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full bg-secondary/50">
                <i className="fas fa-arrow-left text-sm"></i>
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Subscription</h1>
              <p className="text-xs text-muted-foreground">Manage your premium access</p>
            </div>
          </div>
          <i className="fas fa-crown text-accent cursor-pointer"></i>
        </div>

        {/* Current Plan */}
        <div className="px-6 mb-6">
          <Card className={`${isPremium ? 'bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30' : 'bg-card border-border'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <i className={`fas ${isPremium ? 'fa-crown text-accent' : 'fa-user text-muted-foreground'}`}></i>
                  <span className="font-semibold">
                    {isPremium ? 'Premium Plan' : 'Free Plan'}
                  </span>
                </div>
                <Badge className={isPremium ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}>
                  Active
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {isPremium 
                  ? 'Full access to all AI tools and unlimited analyses' 
                  : 'Limited access to basic features'
                }
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold">
                    {isPremium ? '$29.99' : '$0.00'}
                  </span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                {isPremium && (
                  <span className="text-xs text-muted-foreground">
                    Renews {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Statistics */}
        <div className="px-6 mb-6">
          <h3 className="font-semibold mb-3">This Month's Usage</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">AI Analyses</span>
                  <i className="fas fa-robot text-primary text-sm"></i>
                </div>
                <div>
                  <span className="text-xl font-bold">{usage?.analysesCount || 0}</span>
                  <span className="text-sm text-muted-foreground">
                    {isPremium ? ' / Unlimited' : ' / 150 daily'}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">WPS Generated</span>
                  <i className="fas fa-file-alt text-accent text-sm"></i>
                </div>
                <div>
                  <span className="text-xl font-bold">{usage?.wpsCount || 0}</span>
                  <span className="text-sm text-muted-foreground">
                    {isPremium ? ' / Unlimited' : ' / Premium Only'}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Projects</span>
                  <i className="fas fa-folder text-chart-1 text-sm"></i>
                </div>
                <div>
                  <span className="text-xl font-bold">
                    {/* Mock project count */}
                    {Math.floor((usage?.analysesCount || 0) / 10) + 1}
                  </span>
                  <span className="text-sm text-muted-foreground"> / Unlimited</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Exports</span>
                  <i className="fas fa-download text-chart-2 text-sm"></i>
                </div>
                <div>
                  <span className="text-xl font-bold">{usage?.exportsCount || 0}</span>
                  <span className="text-sm text-muted-foreground">
                    {isPremium ? ' / Unlimited' : ' / Premium Only'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="px-6 mb-6">
          <h3 className="font-semibold mb-3">Plan Comparison</h3>
          <div className="space-y-3">
            
            {/* Free Plan */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">Free Plan</h4>
                    <p className="text-lg font-bold">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                  </div>
                  {!isPremium && (
                    <Badge className="bg-secondary text-secondary-foreground">Current</Badge>
                  )}
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-check text-primary"></i>
                    <span>5 AI analyses per day</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-check text-primary"></i>
                    <span>Basic defect analyzer</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-times text-destructive"></i>
                    <span>Limited WPS generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-times text-destructive"></i>
                    <span>No export capabilities</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">Premium Plan</h4>
                      <Badge className="bg-accent text-accent-foreground text-xs">Most Popular</Badge>
                    </div>
                    <p className="text-lg font-bold">$29.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                  </div>
                  {isPremium ? (
                    <Badge className="bg-primary text-primary-foreground">Active</Badge>
                  ) : (
                    <Button
                      onClick={() => upgradeMutation.mutate()}
                      disabled={upgradeMutation.isPending}
                      size="sm"
                      className="bg-primary text-primary-foreground"
                      data-testid="button-upgrade"
                    >
                      {upgradeMutation.isPending ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        'Upgrade'
                      )}
                    </Button>
                  )}
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-check text-primary"></i>
                    <span>Unlimited AI analyses</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-check text-primary"></i>
                    <span>All AI tools access</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-check text-primary"></i>
                    <span>Advanced WPS generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-check text-primary"></i>
                    <span>PDF export & sharing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-check text-primary"></i>
                    <span>Priority support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Billing & Payment */}
        <div className="px-6 mb-6">
          <h3 className="font-semibold mb-3">Billing & Payment</h3>
          <div className="space-y-3">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-credit-card text-muted-foreground"></i>
                    <div>
                      <span className="font-medium text-sm">Payment Method</span>
                      <p className="text-xs text-muted-foreground">•••• •••• •••• 4242</p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-muted-foreground text-sm"></i>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-receipt text-muted-foreground"></i>
                    <span className="font-medium text-sm">Billing History</span>
                  </div>
                  <i className="fas fa-chevron-right text-muted-foreground text-sm"></i>
                </div>
              </CardContent>
            </Card>

            {isPremium && (
              <Card className="bg-destructive/10 border-destructive/30">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-times-circle text-destructive"></i>
                    <span className="font-medium text-sm text-destructive">Cancel Subscription</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
