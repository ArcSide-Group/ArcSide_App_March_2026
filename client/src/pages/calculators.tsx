
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface CalculatorCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
  isPremium?: boolean;
  category: 'welding' | 'fabrication' | 'project';
}

function CalculatorCard({ icon, title, description, href, isPremium, category }: CalculatorCardProps) {
  const { user } = useAuth();
  const canAccess = !isPremium || user?.subscriptionTier !== 'free';
  
  const categoryColors = {
    welding: 'text-primary',
    fabrication: 'text-chart-1', 
    project: 'text-chart-2'
  };

  return (
    <Link href={canAccess ? href : '/subscription'}>
      <Card className={`bg-card border-border hover:border-primary/30 transition-colors ${!canAccess ? 'opacity-60' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className={`w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center`}>
              <i className={`${icon} ${categoryColors[category]} text-lg`}></i>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm">{title}</h3>
                {isPremium && (
                  <Badge variant="secondary" className="text-xs">
                    <i className="fas fa-crown mr-1 text-accent"></i>
                    Pro
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <i className="fas fa-chevron-right text-xs text-muted-foreground"></i>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Calculators() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'welding' | 'fabrication' | 'project'>('all');

  const calculators: CalculatorCardProps[] = [
    // Welding Parameter Calculators
    {
      icon: "fas fa-bolt",
      title: "Voltage & Amperage",
      description: "Calculate optimal welding parameters",
      href: "/calculators/voltage-amperage",
      category: 'welding'
    },
    {
      icon: "fas fa-tachometer-alt",
      title: "Wire Feed Speed",
      description: "Determine proper wire feed rates",
      href: "/calculators/wire-feed-speed", 
      category: 'welding'
    },
    {
      icon: "fas fa-thermometer-half",
      title: "Heat Input",
      description: "Calculate weld heat input values",
      href: "/calculators/heat-input",
      category: 'welding'
    },
    {
      icon: "fas fa-wind",
      title: "Gas Flow Rate",
      description: "Optimize shielding gas flow",
      href: "/calculators/gas-flow",
      category: 'welding'
    },
    {
      icon: "fas fa-fire",
      title: "Preheat & Interpass",
      description: "Temperature calculations",
      href: "/calculators/preheat-temp",
      category: 'welding',
      isPremium: true
    },
    {
      icon: "fas fa-weight",
      title: "Filler Consumption",
      description: "Estimate filler metal usage",
      href: "/calculators/filler-consumption",
      category: 'welding'
    },
    
    // Fabrication Calculators
    {
      icon: "fas fa-balance-scale",
      title: "Metal Weight",
      description: "Calculate material weights",
      href: "/calculators/metal-weight",
      category: 'fabrication'
    },
    {
      icon: "fas fa-cut",
      title: "Cutting Length",
      description: "Optimize material cutting",
      href: "/calculators/cutting-length",
      category: 'fabrication',
      isPremium: true
    },
    {
      icon: "fas fa-expand-arrows-alt",
      title: "Bend Allowance",
      description: "Calculate bend allowances & K-factors",
      href: "/calculators/bend-allowance",
      category: 'fabrication'
    },
    
    // Project & Cost Calculators
    {
      icon: "fas fa-dollar-sign",
      title: "Project Cost Estimator",
      description: "Estimate total project costs",
      href: "/calculators/project-cost",
      category: 'project',
      isPremium: true
    },
    {
      icon: "fas fa-clock",
      title: "Weld Time Estimator",
      description: "Calculate welding time requirements",
      href: "/calculators/weld-time",
      category: 'project',
      isPremium: true
    }
  ];

  const filteredCalculators = calculators.filter(calc => 
    activeFilter === 'all' || calc.category === activeFilter
  );

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
              <h1 className="text-lg font-bold">Calculators</h1>
              <p className="text-xs text-muted-foreground">Welding & fabrication tools</p>
            </div>
          </div>
          <Link href="/calculators/history">
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full">
              <i className="fas fa-history text-sm"></i>
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 mb-6">
          <div className="flex space-x-2 bg-secondary/30 rounded-lg p-1">
            <Button 
              size="sm" 
              className={`flex-1 ${activeFilter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              variant={activeFilter === 'all' ? 'default' : 'ghost'}
              onClick={() => setActiveFilter('all')}
            >
              All
            </Button>
            <Button 
              size="sm"
              className={`flex-1 ${activeFilter === 'welding' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              variant={activeFilter === 'welding' ? 'default' : 'ghost'}
              onClick={() => setActiveFilter('welding')}
            >
              Welding
            </Button>
            <Button 
              size="sm"
              className={`flex-1 ${activeFilter === 'fabrication' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              variant={activeFilter === 'fabrication' ? 'default' : 'ghost'}
              onClick={() => setActiveFilter('fabrication')}
            >
              Fab
            </Button>
            <Button 
              size="sm"
              className={`flex-1 ${activeFilter === 'project' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              variant={activeFilter === 'project' ? 'default' : 'ghost'}
              onClick={() => setActiveFilter('project')}
            >
              Project
            </Button>
          </div>
        </div>

        {/* Calculators Grid */}
        <div className="px-6 space-y-3">
          {filteredCalculators.map((calculator, index) => (
            <CalculatorCard key={index} {...calculator} />
          ))}
        </div>

        {/* Quick Access Info */}
        <div className="px-6 mt-8 mb-6">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-lightbulb text-primary text-sm"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Pro Tip</h4>
                  <p className="text-xs text-muted-foreground">
                    Save your calculations to project folders for easy reference. Upgrade to Premium for advanced calculators and unlimited calculations.
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
