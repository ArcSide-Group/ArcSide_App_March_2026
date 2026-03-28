import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "R 0.00",
    period: "forever",
    description: "Get started with essential welding tools",
    features: [
      "Basic calculators access",
      "Limited AI chatbot (10 queries/day)",
      "1 active project",
      "Small CAD template library",
      "Community support"
    ],
    limitations: [
      "Limited features",
      "Basic support only",
      "Ads included"
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    popular: false,
    icon: Star,
    iconBg: "bg-secondary",
    iconColor: "text-secondary-foreground"
  },
  {
    name: "Premium",
    price: "R 399.00",
    period: "per month",
    description: "For professional welders and small fabrication shops",
    features: [
      "All calculators unlocked",
      "Unlimited AI chatbot interactions",
      "Up to 10 active projects",
      "Expanded CAD template library",
      "Priority email support",
      "Export capabilities",
      "Ad-free experience",
      "Advanced defect analysis"
    ],
    limitations: [],
    buttonText: "Upgrade to Premium",
    buttonVariant: "default" as const,
    popular: true,
    icon: Zap,
    iconBg: "bg-primary/20",
    iconColor: "text-primary"
  },
  {
    name: "Pro / Enterprise",
    price: "R 999.00",
    period: "per month",
    description: "Full solution for large shops and enterprises",
    features: [
      "All Premium features",
      "Full Text-to-CAD access",
      "Unlimited projects & cloud storage",
      "Complete CAD template library",
      "Priority phone & chat support",
      "Custom integrations",
      "Team collaboration tools",
      "Advanced analytics",
      "API access",
      "Custom training sessions"
    ],
    limitations: [],
    buttonText: "Contact Sales",
    buttonVariant: "default" as const,
    popular: false,
    icon: Crown,
    iconBg: "bg-accent/20",
    iconColor: "text-accent"
  }
];

export default function Subscription() {
  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="max-w-sm mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Crown className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1.5">Choose Your Plan</h1>
          <p className="text-sm text-muted-foreground">
            Unlock the full potential of professional welding tools
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="space-y-4">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-border ${
                plan.popular
                  ? 'border-primary shadow-lg ring-1 ring-primary/30'
                  : plan.name === 'Pro / Enterprise'
                    ? 'border-accent/40'
                    : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 font-semibold shadow">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-3 pt-6">
                <div className="flex items-center justify-center mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.iconBg}`}>
                    <plan.icon className={`h-6 w-6 ${plan.iconColor}`} />
                  </div>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1 mt-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/{plan.period}</span>
                </div>
                <CardDescription className="text-xs mt-1">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Features */}
                <ul className="space-y-2">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm">
                      <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        plan.name === 'Pro / Enterprise' ? 'text-accent' : 'text-primary'
                      }`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <ul className="space-y-1 pt-1 border-t border-border">
                    {plan.limitations.map((limitation, li) => (
                      <li key={li} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="w-1 h-1 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA Button */}
                <Button
                  variant={plan.buttonVariant}
                  disabled={plan.name === 'Free'}
                  className={`w-full h-11 font-semibold ${
                    plan.buttonVariant === 'default' && plan.popular
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : plan.buttonVariant === 'default' && !plan.popular
                        ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                        : ''
                  }`}
                >
                  {plan.popular && <Zap className="h-4 w-4 mr-2" />}
                  {plan.name === 'Pro / Enterprise' && <Crown className="h-4 w-4 mr-2" />}
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <Card className="mt-7 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-question-circle text-primary text-sm"></i>
              Frequently Asked Questions
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">Can I change plans anytime?</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Is there a free trial?</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">Premium plans include a 14-day free trial. No credit card required to start.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">What payment methods do you accept?</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">We accept all major credit cards, Snapscan, EFT transfers, and corporate POs for Enterprise plans. All prices in South African Rands (ZAR).</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-5">
          <p className="text-xs text-muted-foreground mb-2">Need help choosing the right plan?</p>
          <Button variant="link" className="text-primary p-0 text-sm">
            Contact our sales team →
          </Button>
        </div>
      </div>
    </div>
  );
}
