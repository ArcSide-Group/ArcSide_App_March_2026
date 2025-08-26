
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

export default function CalculatorHistory() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

  const { data: calculations, isLoading } = useQuery({
    queryKey: ['calculatorHistory'],
    queryFn: async () => {
      const response = await fetch('/api/calculators/history');
      if (!response.ok) throw new Error('Failed to fetch history');
      return response.json();
    },
    enabled: !!user,
  });

  const getCalculatorIcon = (type: string) => {
    const icons: Record<string, string> = {
      'voltage-amperage': 'fas fa-bolt',
      'wire-feed-speed': 'fas fa-tachometer-alt',
      'heat-input': 'fas fa-thermometer-half',
      'gas-flow': 'fas fa-wind',
      'metal-weight': 'fas fa-balance-scale',
      'bend-allowance': 'fas fa-expand-arrows-alt',
      'project-cost': 'fas fa-dollar-sign'
    };
    return icons[type] || 'fas fa-calculator';
  };

  const getCalculatorTitle = (type: string) => {
    const titles: Record<string, string> = {
      'voltage-amperage': 'Voltage & Amperage',
      'wire-feed-speed': 'Wire Feed Speed',
      'heat-input': 'Heat Input',
      'gas-flow': 'Gas Flow Rate',
      'metal-weight': 'Metal Weight',
      'bend-allowance': 'Bend Allowance',
      'project-cost': 'Project Cost'
    };
    return titles[type] || 'Calculator';
  };

  const filteredCalculations = calculations?.filter((calc: any) => 
    filter === 'all' || calc.calculatorType.includes(filter)
  ) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <Link href="/calculators">
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full bg-secondary/50">
                <i className="fas fa-arrow-left text-sm"></i>
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Calculator History</h1>
              <p className="text-xs text-muted-foreground">Your saved calculations</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 mb-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'welding', label: 'Welding' },
              { key: 'fabrication', label: 'Fabrication' },
              { key: 'project', label: 'Project' }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={filter === tab.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(tab.key)}
                className="whitespace-nowrap"
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Calculations List */}
        <div className="px-6 space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-muted-foreground mb-2"></i>
              <p className="text-sm text-muted-foreground">Loading calculations...</p>
            </div>
          ) : filteredCalculations.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-calculator text-muted-foreground text-2xl mb-2"></i>
              <p className="text-sm text-muted-foreground">No calculations found</p>
            </div>
          ) : (
            filteredCalculations.map((calculation: any) => (
              <Card key={calculation.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center">
                      <i className={`${getCalculatorIcon(calculation.calculatorType)} text-primary text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm truncate">
                          {calculation.title || getCalculatorTitle(calculation.calculatorType)}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {new Date(calculation.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {getCalculatorTitle(calculation.calculatorType)}
                      </p>
                      
                      {/* Show key results */}
                      <div className="text-xs space-y-1">
                        {calculation.results && typeof calculation.results === 'object' && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(calculation.results).slice(0, 2).map(([key, value]: [string, any]) => (
                              <div key={key} className="bg-secondary/30 rounded px-2 py-1">
                                <span className="font-medium">{String(value)}</span>
                                <span className="text-muted-foreground ml-1">{key}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
