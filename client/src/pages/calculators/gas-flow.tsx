
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';

interface GasFlowResult {
  flowRate: number;
  unit: string;
  range: string;
  gasType: string;
  recommendations: string[];
}

export default function GasFlow() {
  const [formData, setFormData] = useState({
    process: 'GMAW',
    material: 'mild-steel',
    thickness: '0.25',
    position: 'flat',
    environment: 'indoor'
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/calculators/gas-flow', {
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
      ...formData,
      thickness: parseFloat(formData.thickness)
    };
    calculateMutation.mutate(calculationData);
  };

  const result = calculateMutation.data?.result as GasFlowResult;

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
              <h1 className="text-lg font-bold">Gas Flow Rate</h1>
              <p className="text-xs text-muted-foreground">Optimize shielding gas flow</p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="px-6 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Welding Process</Label>
                <Select value={formData.process} onValueChange={(value) => setFormData(prev => ({ ...prev, process: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GMAW">GMAW (MIG/MAG)</SelectItem>
                    <SelectItem value="GTAW">GTAW (TIG)</SelectItem>
                    <SelectItem value="FCAW">FCAW (Flux Core)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Material</Label>
                <Select value={formData.material} onValueChange={(value) => setFormData(prev => ({ ...prev, material: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild-steel">Mild Steel</SelectItem>
                    <SelectItem value="stainless-steel">Stainless Steel</SelectItem>
                    <SelectItem value="aluminum">Aluminum</SelectItem>
                    <SelectItem value="carbon-steel">Carbon Steel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Thickness (inches)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.thickness}
                  onChange={(e) => setFormData(prev => ({ ...prev, thickness: e.target.value }))}
                  placeholder="Enter thickness"
                />
              </div>

              <div className="space-y-2">
                <Label>Welding Position</Label>
                <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat (1G)</SelectItem>
                    <SelectItem value="horizontal">Horizontal (2G)</SelectItem>
                    <SelectItem value="vertical">Vertical (3G)</SelectItem>
                    <SelectItem value="overhead">Overhead (4G)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Environment</Label>
                <Select value={formData.environment} onValueChange={(value) => setFormData(prev => ({ ...prev, environment: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indoor">Indoor/Calm</SelectItem>
                    <SelectItem value="windy">Windy/Outdoor</SelectItem>
                    <SelectItem value="confined">Confined Space</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleCalculate} 
                disabled={calculateMutation.isPending}
                className="w-full"
              >
                {calculateMutation.isPending ? 'Calculating...' : 'Calculate Gas Flow'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Gas Flow Results</h3>
                  <Badge variant="secondary">
                    <i className="fas fa-check mr-1"></i>
                    Calculated
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background rounded-lg p-3">
                    <div className="text-xl font-bold text-primary">{result.flowRate} {result.unit}</div>
                    <div className="text-sm text-muted-foreground">Flow Rate</div>
                  </div>
                  <div className="bg-background rounded-lg p-3">
                    <div className="text-sm font-semibold">{result.gasType}</div>
                    <div className="text-sm text-muted-foreground">Gas Type</div>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-3">
                  <div className="text-sm font-semibold">{result.range}</div>
                  <div className="text-sm text-muted-foreground">Recommended Range</div>
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
