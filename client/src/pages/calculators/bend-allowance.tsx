
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';

interface BendAllowanceResult {
  bendAllowance: number;
  setback: number;
  kFactor: number;
  unit: string;
  recommendations: string[];
}

export default function BendAllowance() {
  const [formData, setFormData] = useState({
    thickness: '0.125',
    bendAngle: '90',
    insideRadius: '0.125',
    kFactor: '0.33'
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/calculators/bend-allowance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Calculation failed');
      return response.json();
    },
  });

  const handleCalculate = () => {
    const calculationData = {
      thickness: parseFloat(formData.thickness),
      bendAngle: parseFloat(formData.bendAngle),
      insideRadius: parseFloat(formData.insideRadius),
      kFactor: parseFloat(formData.kFactor)
    };
    calculateMutation.mutate(calculationData);
  };

  const result = calculateMutation.data?.result as BendAllowanceResult;

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
              <h1 className="text-lg font-bold">Bend Allowance</h1>
              <p className="text-xs text-muted-foreground">Calculate bend allowances & K-factors</p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="px-6 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Material Thickness (in)</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={formData.thickness}
                  onChange={(e) => setFormData(prev => ({ ...prev, thickness: e.target.value }))}
                  placeholder="Enter thickness"
                />
              </div>

              <div className="space-y-2">
                <Label>Bend Angle (degrees)</Label>
                <Input
                  type="number"
                  value={formData.bendAngle}
                  onChange={(e) => setFormData(prev => ({ ...prev, bendAngle: e.target.value }))}
                  placeholder="Enter bend angle"
                />
              </div>

              <div className="space-y-2">
                <Label>Inside Radius (in)</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={formData.insideRadius}
                  onChange={(e) => setFormData(prev => ({ ...prev, insideRadius: e.target.value }))}
                  placeholder="Enter inside radius"
                />
              </div>

              <div className="space-y-2">
                <Label>K-Factor</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="0.5"
                  value={formData.kFactor}
                  onChange={(e) => setFormData(prev => ({ ...prev, kFactor: e.target.value }))}
                  placeholder="Enter K-factor (0.1-0.5)"
                />
                <p className="text-xs text-muted-foreground">
                  Typical values: Soft materials 0.33, Hard materials 0.40-0.45
                </p>
              </div>

              <Button 
                onClick={handleCalculate} 
                disabled={calculateMutation.isPending}
                className="w-full"
              >
                {calculateMutation.isPending ? 'Calculating...' : 'Calculate Bend Allowance'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Bend Allowance Results</h3>
                  <Badge variant="secondary">
                    <i className="fas fa-check mr-1"></i>
                    Calculated
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background rounded-lg p-3">
                    <div className="text-lg font-bold text-primary">{result.bendAllowance} {result.unit}</div>
                    <div className="text-sm text-muted-foreground">Bend Allowance</div>
                  </div>
                  <div className="bg-background rounded-lg p-3">
                    <div className="text-lg font-bold text-chart-1">{result.setback} {result.unit}</div>
                    <div className="text-sm text-muted-foreground">Setback</div>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-3">
                  <div className="text-sm font-semibold">K-Factor: {result.kFactor}</div>
                  <div className="text-sm text-muted-foreground">Material constant used</div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Recommendations:</h4>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-start">
                        <i className="fas fa-check-circle text-primary mr-2 mt-0.5"></i>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
