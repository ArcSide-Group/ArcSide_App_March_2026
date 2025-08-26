
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';

interface HeatInputResult {
  heatInput: number;
  unit: string;
  classification: string;
  recommendations: string[];
}

export default function HeatInput() {
  const [formData, setFormData] = useState({
    voltage: '18',
    amperage: '150',
    travelSpeed: '8',
    efficiency: '0.8'
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/calculators/heat-input', {
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
      voltage: parseFloat(formData.voltage),
      amperage: parseFloat(formData.amperage),
      travelSpeed: parseFloat(formData.travelSpeed),
      efficiency: parseFloat(formData.efficiency)
    };
    calculateMutation.mutate(calculationData);
  };

  const result = calculateMutation.data?.result as HeatInputResult;

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
              <h1 className="text-lg font-bold">Heat Input</h1>
              <p className="text-xs text-muted-foreground">Calculate heat input values</p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="px-6 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Voltage (V)</Label>
                <Input
                  type="number"
                  value={formData.voltage}
                  onChange={(e) => setFormData(prev => ({ ...prev, voltage: e.target.value }))}
                  placeholder="Enter voltage"
                />
              </div>

              <div className="space-y-2">
                <Label>Amperage (A)</Label>
                <Input
                  type="number"
                  value={formData.amperage}
                  onChange={(e) => setFormData(prev => ({ ...prev, amperage: e.target.value }))}
                  placeholder="Enter amperage"
                />
              </div>

              <div className="space-y-2">
                <Label>Travel Speed (in/min)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.travelSpeed}
                  onChange={(e) => setFormData(prev => ({ ...prev, travelSpeed: e.target.value }))}
                  placeholder="Enter travel speed"
                />
              </div>

              <div className="space-y-2">
                <Label>Process Efficiency</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="1.0"
                  value={formData.efficiency}
                  onChange={(e) => setFormData(prev => ({ ...prev, efficiency: e.target.value }))}
                  placeholder="Enter efficiency (0.1-1.0)"
                />
              </div>

              <Button 
                onClick={handleCalculate} 
                disabled={calculateMutation.isPending}
                className="w-full"
              >
                {calculateMutation.isPending ? 'Calculating...' : 'Calculate Heat Input'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Heat Input Results</h3>
                  <Badge variant={result.classification === 'High' ? 'destructive' : 'secondary'}>
                    {result.classification}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-background rounded-lg p-3">
                    <div className="text-2xl font-bold text-primary">{result.heatInput} {result.unit}</div>
                    <div className="text-sm text-muted-foreground">Heat Input</div>
                  </div>
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
