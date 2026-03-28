import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation } from '@tanstack/react-query';
import { Clock, DollarSign } from 'lucide-react';
import { useUnits } from '@/hooks/useUnits';

interface WeldTimeResult {
  arcTimeMin: number;
  setupTimeMin: number;
  totalTimeMin: number;
  totalHours: number;
  laborCost: number;
  arcEfficiency: number;
  recommendations: string[];
}

export default function WeldTime() {
  const { labels, toImperial, defaults } = useUnits();

  const [formData, setFormData] = useState({
    weldLength: defaults.weldLength,
    travelSpeed: defaults.travelSpeed,
    passes: '1',
    numberOfJoints: '4',
    setupTimePerJoint: '10',
    arcEfficiency: '35',
    laborRate: '500',
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/calculators/weld-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Calculation failed');
      return res.json();
    },
  });

  const handleCalculate = () => {
    calculateMutation.mutate({
      weldLength: toImperial.length(parseFloat(formData.weldLength)),
      travelSpeed: toImperial.speed(parseFloat(formData.travelSpeed)),
      passes: parseInt(formData.passes),
      numberOfJoints: parseInt(formData.numberOfJoints),
      setupTimePerJoint: parseFloat(formData.setupTimePerJoint),
      arcEfficiency: parseFloat(formData.arcEfficiency),
      laborRate: parseFloat(formData.laborRate),
    });
  };

  const result = calculateMutation.data?.result as WeldTimeResult | undefined;
  const hours = result ? Math.floor(result.totalTimeMin / 60) : 0;
  const minutes = result ? Math.round(result.totalTimeMin % 60) : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">

        <div className="flex items-center space-x-3 p-6 pb-4">
          <Link href="/calculators">
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full bg-secondary/50">
              <i className="fas fa-arrow-left text-sm"></i>
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold">Weld Time Estimator</h1>
            <p className="text-xs text-muted-foreground">Project time & labor cost</p>
          </div>
          <Badge variant="secondary" className="ml-auto text-xs">
            <i className="fas fa-crown mr-1 text-accent"></i>Pro
          </Badge>
        </div>

        <div className="px-6 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Total Weld Length ({labels.length})</Label>
                <Input type="number" value={formData.weldLength} onChange={(e) => setFormData(p => ({ ...p, weldLength: e.target.value }))} placeholder={defaults.weldLength} />
              </div>

              <div className="space-y-2">
                <Label>Travel Speed ({labels.speed})</Label>
                <Input type="number" step="0.5" value={formData.travelSpeed} onChange={(e) => setFormData(p => ({ ...p, travelSpeed: e.target.value }))} placeholder={defaults.travelSpeed} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Passes</Label>
                  <Input type="number" min="1" value={formData.passes} onChange={(e) => setFormData(p => ({ ...p, passes: e.target.value }))} placeholder="1" />
                </div>
                <div className="space-y-2">
                  <Label>Joints / Setups</Label>
                  <Input type="number" min="1" value={formData.numberOfJoints} onChange={(e) => setFormData(p => ({ ...p, numberOfJoints: e.target.value }))} placeholder="4" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Setup Time per Joint (min)</Label>
                <Input type="number" value={formData.setupTimePerJoint} onChange={(e) => setFormData(p => ({ ...p, setupTimePerJoint: e.target.value }))} placeholder="10" />
              </div>

              <div className="space-y-2">
                <Label>Arc-On Efficiency (%)</Label>
                <Select value={formData.arcEfficiency} onValueChange={(v) => setFormData(p => ({ ...p, arcEfficiency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20% — Very slow / heavy fit-up</SelectItem>
                    <SelectItem value="30">30% — Production welding, SMAW</SelectItem>
                    <SelectItem value="35">35% — Typical shop average</SelectItem>
                    <SelectItem value="45">45% — GMAW / FCAW production</SelectItem>
                    <SelectItem value="60">60% — High efficiency / SAW</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Labor Rate (R/hr) — optional</Label>
                <Input type="number" value={formData.laborRate} onChange={(e) => setFormData(p => ({ ...p, laborRate: e.target.value }))} placeholder="500" />
              </div>

              <Button onClick={handleCalculate} disabled={calculateMutation.isPending} className="w-full">
                {calculateMutation.isPending ? 'Calculating...' : 'Estimate Time'}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">Time Estimate</h3>
                <div className="bg-background rounded-lg p-4 text-center">
                  <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold text-primary">
                    {hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`}
                  </div>
                  <div className="text-sm text-muted-foreground">Total estimated time</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-chart-1">{result.arcTimeMin} min</div>
                    <div className="text-xs text-muted-foreground">Arc time</div>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-chart-2">{result.setupTimeMin} min</div>
                    <div className="text-xs text-muted-foreground">Setup time</div>
                  </div>
                </div>
                {result.laborCost > 0 && (
                  <div className="bg-background rounded-lg p-3 flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="text-xl font-bold text-green-500">${result.laborCost.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Estimated labor cost</div>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Notes:</h4>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <i className="fas fa-info-circle text-primary mt-0.5 shrink-0"></i>
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
