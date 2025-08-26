import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const subscriptionTiers = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    features: [
      'Basic calculators (5 per day)',
      'Limited AI chatbot (10 messages/day)',
      '1 active project',
      'Small CAD template library',
      'Community support'
    ],
    limitations: [
      'Limited calculations',
      'Basic templates only',
      'No offline access',
      'Standard support'
    ],
    current: true,
    buttonText: 'Current Plan',
    popular: false
  },
  {
    name: 'Premium',
    price: 19.99,
    period: 'month',
    features: [
      'All calculators (unlimited)',
      'Unlimited AI chatbot interactions',
      'Up to 10 active projects',
      'Extended CAD template library',
      'Offline functionality',
      'Export calculations (PDF/Excel)',
      'Priority support',
      'Ad-free experience'
    ],
    limitations: [
      'Limited Text-to-CAD features',
      'Standard cloud storage (5GB)'
    ],
    current: false,
    buttonText: 'Upgrade to Premium',
    popular: true
  },
  {
    name: 'Pro',
    price: 49.99,
    period: 'month',
    features: [
      'Everything in Premium',
      'Full Text-to-CAD access',
      'Unlimited active projects',
      'Complete CAD template library',
      'Unlimited cloud storage',
      'Advanced project management',
      'Team collaboration tools',
      'Custom WPS templates',
      'Priority customer support',
      'Early access to new features'
    ],
    limitations: [],
    current: false,
    buttonText: 'Upgrade to Pro',
    popular: false
  }
];

export default function Subscription() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const upgradeMutation = useMutation({
    mutationFn: async (tier: string) => {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      if (!response.ok) throw new Error('Failed to upgrade subscription');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Subscription upgraded successfully!');
      queryClient.invalidateQueries();
      setLocation('/');
    },
    onError: () => {
      toast.error('Failed to upgrade subscription');
    }
  });

  const handleUpgrade = (tierName: string) => {
    if (tierName === 'Free') return;
    // In a real app, this would integrate with Stripe/PayPal
    upgradeMutation.mutate(tierName.toLowerCase());
  };

  const currentTier = user?.subscriptionTier || 'free';

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full bg-secondary/50">
                <i className="fas fa-arrow-left text-sm"></i>
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Subscription</h1>
              <p className="text-xs text-muted-foreground">Choose your plan</p>
            </div>
          </div>
          <Badge variant="outline">
            {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
          </Badge>
        </div>

        {/* Current Plan */}
        {user && (
          <div className="px-6 mb-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Current Plan</h3>
                  <Badge variant="default">
                    {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentTier === 'free' 
                    ? 'You are currently on the free plan. Upgrade for unlimited access to all features.'
                    : `You have full access to all ${currentTier} features. Thanks for supporting ArcSide!`
                  }
                </p>
                {user.subscriptionExpiresAt && currentTier !== 'free' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Renews on {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subscription Tiers */}
        <div className="px-6 space-y-4">
          {subscriptionTiers.map((tier) => {
            const isCurrentTier = currentTier === tier.name.toLowerCase();
            const canUpgrade = currentTier === 'free' && tier.name !== 'Free';

            return (
              <Card key={tier.name} className={`relative ${tier.popular ? 'border-primary shadow-lg' : 'border-border'}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    {isCurrentTier && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold">
                      ${tier.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /{tier.period}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Features included:</h4>
                    <ul className="space-y-1">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-0.5"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {tier.limitations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Limitations:</h4>
                      <ul className="space-y-1">
                        {tier.limitations.map((limitation, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-start">
                            <i className="fas fa-times text-orange-500 mr-2 mt-0.5"></i>
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button 
                    onClick={() => handleUpgrade(tier.name)}
                    disabled={isCurrentTier || upgradeMutation.isPending}
                    className={`w-full ${tier.popular ? 'bg-primary' : ''}`}
                    variant={isCurrentTier ? 'secondary' : (canUpgrade ? 'default' : 'outline')}
                  >
                    {upgradeMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Processing...
                      </>
                    ) : (
                      tier.buttonText
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="px-6 mt-8 mb-6">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold">Frequently Asked Questions</h3>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm">Can I cancel anytime?</h4>
                  <p className="text-xs text-muted-foreground">
                    Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm">What payment methods do you accept?</h4>
                  <p className="text-xs text-muted-foreground">
                    We accept all major credit cards, PayPal, and bank transfers for annual plans.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm">Is there a free trial?</h4>
                  <p className="text-xs text-muted-foreground">
                    The free plan gives you access to basic features. Premium and Pro plans offer 7-day free trials.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}