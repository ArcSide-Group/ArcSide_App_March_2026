import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with basic welding tools",
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
    icon: Star
  },
  {
    name: "Premium",
    price: "$19.99",
    period: "per month",
    description: "Ideal for professional welders and small fabrication shops",
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
    icon: Zap
  },
  {
    name: "Pro/Enterprise",
    price: "$49.99",
    period: "per month",
    description: "Complete solution for large fabrication shops and enterprises",
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
    icon: Crown
  }
];

export default function Subscription() {
  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="max-w-sm mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">
            Unlock the full potential of professional welding tools
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="space-y-6">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-[#4CAF50] shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-[#4CAF50] text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-2">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan.name === 'Free' ? 'bg-gray-100' :
                    plan.name === 'Premium' ? 'bg-[#4CAF50]/20' : 'bg-gradient-to-r from-purple-500/20 to-amber-500/20'
                  }`}>
                    <plan.icon className={`h-6 w-6 ${
                      plan.name === 'Free' ? 'text-gray-600' :
                      plan.name === 'Premium' ? 'text-[#4CAF50]' : 'text-amber-600'
                    }`} />
                  </div>
                </div>

                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">/{plan.period}</span>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">What's included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-[#4CAF50] mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations (for Free plan) */}
                {plan.limitations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Limitations:</h4>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  variant={plan.buttonVariant}
                  className={`w-full ${
                    plan.buttonVariant === 'default' 
                      ? 'bg-[#4CAF50] hover:bg-[#45a049] text-white' 
                      : ''
                  }`}
                  disabled={plan.name === 'Free'}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card className="mt-8 bg-gradient-to-r from-[#4CAF50]/5 to-blue-500/5 border-[#4CAF50]/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">Can I change plans anytime?</h4>
                <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Is there a free trial?</h4>
                <p className="text-muted-foreground">Premium plans include a 14-day free trial. No credit card required to start.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">What payment methods do you accept?</h4>
                <p className="text-muted-foreground">We accept all major credit cards, PayPal, and corporate purchase orders for Enterprise plans.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground mb-2">
            Need help choosing the right plan?
          </p>
          <Button variant="link" className="text-[#4CAF50] p-0">
            Contact our sales team
          </Button>
        </div>
      </div>
    </div>
  );
}