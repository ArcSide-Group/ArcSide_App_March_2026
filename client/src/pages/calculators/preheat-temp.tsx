import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation } from '@tanstack/react-query';
import { Thermometer } from 'lucide-react';
import { useUnits } from '@/hooks/useUnits';

interface PreheatResult {
  preheatF: number;
  preheatC: number;
  maxInterpassF: number;
  maxInterpassC: number;
  carbonEquivalent: number;
  riskLevel: string;
  recommendations: string[];
}

export default function PreheatTemp() {
  const { isMetric, labels, toImperial, defaults } = useUnits();

  const [formData, setFormData] = useState({
    material: 'a36',
    thickness: defaults.thickness,
    process: 'SMAW',
    heatInput: defaults.heatInput,
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/calculators/preheat-temp', {
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
      material: formData.material,
      thickness: toImperial.length(parseFloat(formData.thickness)),
      process: formData.process,
      heatInput: isMetric
        ? parseFloat(formData.heatInput) * 25.4
        : parseFloat(formData.heatInput),
    });
  };

  const result = calculateMutation.data?.result as PreheatResult | undefined;

  const riskColor = result?.riskLevel === 'High' ? 'destructive' : result?.riskLevel === 'Moderate' ? 'secondary' : 'outline';

  const preheat = result ? (isMetric ? result.preheatC : result.preheatF) : null;
  const maxInterpass = result ? (isMetric ? result.maxInterpassC : result.maxInterpassF) : null;

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
            <h1 className="text-lg font-bold">Preheat & Interpass</h1>
            <p className="text-xs text-muted-foreground">AWS D1.1 based temperature guidance</p>
          </div>
          <Badge variant="secondary" className="ml-auto text-xs">
            <i className="fas fa-crown mr-1 text-accent"></i>Pro
          </Badge>
        </div>

        <div className="px-6 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Base Material / Grade</Label>
                <Select value={formData.material} onValueChange={(v) => setFormData(p => ({ ...p, material: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a36">A36 (Structural)</SelectItem>
                    <SelectItem value="a572-gr50">A572 Gr.50</SelectItem>
                    <SelectItem value="a992">A992 (Wide Flange)</SelectItem>
                    <SelectItem value="a514">A514 (T-1 / High Strength)</SelectItem>
                    <SelectItem value="1018">1018 Mild Steel</SelectItem>
                    <SelectItem value="1020">1020 Carbon Steel</SelectItem>
                    <SelectItem value="1045">1045 Medium Carbon</SelectItem>
                    <SelectItem value="4130">4130 Chromoly</SelectItem>
                    <SelectItem value="4140">4140 Chromoly</SelectItem>
                    <SelectItem value="dom">DOM Tubing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Material Thickness ({labels.length})</Label>
                <Input type="number" step="0.5" min="0.5" value={formData.thickness} onChange={(e) => setFormData(p => ({ ...p, thickness: e.target.value }))} placeholder={`e.g. ${defaults.thickness}`} />
              </div>

              <div className="space-y-2">
                <Label>Welding Process</Label>
                <Select value={formData.process} onValueChange={(v) => setFormData(p => ({ ...p, process: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMAW">SMAW (Stick)</SelectItem>
                    <SelectItem value="GMAW">GMAW (MIG)</SelectItem>
                    <SelectItem value="FCAW">FCAW (Flux Core)</SelectItem>
                    <SelectItem value="GTAW">GTAW (TIG)</SelectItem>
                    <SelectItem value="SAW">SAW (Submerged Arc)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Expected Heat Input ({isMetric ? 'kJ/mm' : 'kJ/in'})</Label>
                <Input type="number" step="0.1" min="0.1" value={formData.heatInput} onChange={(e) => setFormData(p => ({ ...p, heatInput: e.target.value }))} placeholder={`e.g. ${defaults.heatInput}`} />
              </div>

              <Button onClick={handleCalculate} disabled={calculateMutation.isPending} className="w-full">
                {calculateMutation.isPending ? 'Calculating...' : 'Calculate Temperatures'}
              </Button>
            </CardContent>
          </Card>

          {result && preheat !== null && maxInterpass !== null && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Temperature Results</h3>
                  <Badge variant={riskColor as any}>{result.riskLevel} Risk</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background rounded-lg p-3 text-center">
                    <Thermometer className="h-5 w-5 text-orange-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-primary">{preheat}{labels.temp}</div>
                    <div className="text-xs text-muted-foreground mt-1">Min Preheat</div>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <Thermometer className="h-5 w-5 text-red-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-destructive">{maxInterpass}{labels.temp}</div>
                    <div className="text-xs text-muted-foreground mt-1">Max Interpass</div>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Carbon Equivalent (CE)</div>
                  <div className="text-2xl font-bold text-primary">{result.carbonEquivalent}</div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Requirements:</h4>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <i className="fas fa-check-circle text-primary mt-0.5 shrink-0"></i>
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
