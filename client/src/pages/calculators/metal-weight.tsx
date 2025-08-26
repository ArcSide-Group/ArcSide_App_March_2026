
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';

interface MetalWeightResult {
  weight: number;
  unit: string;
  volume: number;
  volumeUnit: string;
  density: number;
  recommendations: string[];
}

export default function MetalWeight() {
  const [formData, setFormData] = useState({
    material: 'steel',
    shape: 'plate',
    length: '12',
    width: '6',
    thickness: '0.25',
    diameter: '1',
    outerDiameter: '2',
    innerDiameter: '1.5'
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/calculators/metal-weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Calculation failed');
      return response.json();
    },
  });

  const handleCalculate = () => {
    const dimensions: any = {};
    
    if (formData.shape === 'plate') {
      dimensions.length = parseFloat(formData.length);
      dimensions.width = parseFloat(formData.width);
      dimensions.thickness = parseFloat(formData.thickness);
    } else if (formData.shape === 'rod') {
      dimensions.diameter = parseFloat(formData.diameter);
      dimensions.length = parseFloat(formData.length);
    } else if (formData.shape === 'tube') {
      dimensions.outerDiameter = parseFloat(formData.outerDiameter);
      dimensions.innerDiameter = parseFloat(formData.innerDiameter);
      dimensions.length = parseFloat(formData.length);
    }

    const calculationData = {
      material: formData.material,
      shape: formData.shape,
      dimensions
    };
    calculateMutation.mutate(calculationData);
  };

  const result = calculateMutation.data?.result as MetalWeightResult;

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
              <h1 className="text-lg font-bold">Metal Weight</h1>
              <p className="text-xs text-muted-foreground">Calculate material weights</p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="px-6 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Material</Label>
                <Select value={formData.material} onValueChange={(value) => setFormData(prev => ({ ...prev, material: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="steel">Steel</SelectItem>
                    <SelectItem value="aluminum">Aluminum</SelectItem>
                    <SelectItem value="stainless">Stainless Steel</SelectItem>
                    <SelectItem value="copper">Copper</SelectItem>
                    <SelectItem value="brass">Brass</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Shape</Label>
                <Select value={formData.shape} onValueChange={(value) => setFormData(prev => ({ ...prev, shape: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plate">Plate</SelectItem>
                    <SelectItem value="rod">Rod/Bar</SelectItem>
                    <SelectItem value="tube">Tube/Pipe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.shape === 'plate' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Length (in)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.length}
                        onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                        placeholder="Length"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Width (in)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.width}
                        onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                        placeholder="Width"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Thickness (in)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.thickness}
                      onChange={(e) => setFormData(prev => ({ ...prev, thickness: e.target.value }))}
                      placeholder="Thickness"
                    />
                  </div>
                </>
              )}

              {formData.shape === 'rod' && (
                <>
                  <div className="space-y-2">
                    <Label>Diameter (in)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.diameter}
                      onChange={(e) => setFormData(prev => ({ ...prev, diameter: e.target.value }))}
                      placeholder="Diameter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Length (in)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.length}
                      onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                      placeholder="Length"
                    />
                  </div>
                </>
              )}

              {formData.shape === 'tube' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Outer Ø (in)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.outerDiameter}
                        onChange={(e) => setFormData(prev => ({ ...prev, outerDiameter: e.target.value }))}
                        placeholder="Outer diameter"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Inner Ø (in)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.innerDiameter}
                        onChange={(e) => setFormData(prev => ({ ...prev, innerDiameter: e.target.value }))}
                        placeholder="Inner diameter"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Length (in)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.length}
                      onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                      placeholder="Length"
                    />
                  </div>
                </>
              )}

              <Button 
                onClick={handleCalculate} 
                disabled={calculateMutation.isPending}
                className="w-full"
              >
                {calculateMutation.isPending ? 'Calculating...' : 'Calculate Weight'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Weight Results</h3>
                  <Badge variant="secondary">
                    <i className="fas fa-check mr-1"></i>
                    Calculated
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background rounded-lg p-3">
                    <div className="text-xl font-bold text-primary">{result.weight} {result.unit}</div>
                    <div className="text-sm text-muted-foreground">Total Weight</div>
                  </div>
                  <div className="bg-background rounded-lg p-3">
                    <div className="text-sm font-semibold">{result.volume} {result.volumeUnit}</div>
                    <div className="text-sm text-muted-foreground">Volume</div>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-3">
                  <div className="text-sm font-semibold">{result.density} lb/in³</div>
                  <div className="text-sm text-muted-foreground">Material Density</div>
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
