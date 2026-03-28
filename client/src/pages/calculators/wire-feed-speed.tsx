import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { useUnits } from '@/hooks/useUnits';

interface WireFeedSpeedResult {
  wireSpeed: number;
  unit: string;
  recommendations: string[];
}

export default function WireFeedSpeed() {
  const { labels, fromImperial } = useUnits();

  const [formData, setFormData] = useState({
    amperage: '150',
    wireSize: '0.035',
    material: 'mild-steel'
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/calculators/wire-feed-speed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Calculation failed');
      return response.json();
    },
  });

  const handleCalculate = () => {
    calculateMutation.mutate({
      amperage: parseFloat(formData.amperage),
      wireSize: parseFloat(formData.wireSize),
      material: formData.material
    });
  };

  const result = calculateMutation.data?.result as WireFeedSpeedResult;
  const displaySpeed = result ? fromImperial.speed(result.wireSpeed) : null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">

        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <Link href="/calculators">
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full bg-secondary/50">
                <i className="fas fa-arrow-left text-sm"></i>
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Wire Feed Speed</h1>
              <p className="text-xs text-muted-foreground">Calculate wire feed rates</p>
            </div>
          </div>
        </div>

        <div className="px-6 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Amperage (A)</Label>
                <Input type="number" value={formData.amperage} onChange={(e) => setFormData(prev => ({ ...prev, amperage: e.target.value }))} placeholder="Enter amperage" />
              </div>

              <div className="space-y-2">
                <Label>Wire Size</Label>
                <Select value={formData.wireSize} onValueChange={(value) => setFormData(prev => ({ ...prev, wireSize: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.023">0.023" (0.6mm)</SelectItem>
                    <SelectItem value="0.030">0.030" (0.8mm)</SelectItem>
                    <SelectItem value="0.035">0.035" (0.9mm)</SelectItem>
                    <SelectItem value="0.045">0.045" (1.2mm)</SelectItem>
                    <SelectItem value="0.052">0.052" (1.4mm)</SelectItem>
                    <SelectItem value="0.0625">1/16" (1.6mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Material</Label>
                <Select value={formData.material} onValueChange={(value) => setFormData(prev => ({ ...prev, material: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild-steel">Mild Steel</SelectItem>
                    <SelectItem value="stainless-steel">Stainless Steel</SelectItem>
                    <SelectItem value="aluminum">Aluminum</SelectItem>
                    <SelectItem value="carbon-steel">Carbon Steel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleCalculate} disabled={calculateMutation.isPending} className="w-full">
                {calculateMutation.isPending ? 'Calculating...' : 'Calculate Wire Speed'}
              </Button>
            </CardContent>
          </Card>

          {result && displaySpeed !== null && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Wire Feed Speed</h3>
                  <Badge variant="secondary"><i className="fas fa-check mr-1"></i>Calculated</Badge>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">{displaySpeed} {labels.speed}</div>
                  <div className="text-sm text-muted-foreground">Wire Feed Speed</div>
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
