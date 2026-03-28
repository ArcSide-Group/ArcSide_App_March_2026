import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Download } from "lucide-react";
import { exportWpsPdf } from "@/lib/pdf-export";

export default function WpsGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    projectName: "",
    baseMaterial: "",
    thickness: "",
    jointType: "",
    process: "GMAW",
    standard: "",
  });
  const [wpsResult, setWpsResult] = useState<any>(null);

  const generateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/ai/generate-wps', data);
      return response.json();
    },
    onSuccess: (data) => {
      setWpsResult(data);
      toast({
        title: "WPS Generated",
        description: "Welding Procedure Specification generated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Generation Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!formData.projectName || !formData.baseMaterial) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate(formData);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if ((user as User)?.subscriptionTier !== 'premium') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full bg-secondary/50">
                  <i className="fas fa-arrow-left text-sm"></i>
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold">WPS Generator</h1>
                <p className="text-xs text-muted-foreground">Premium feature</p>
              </div>
            </div>
            <i className="fas fa-crown text-accent"></i>
          </div>

          <div className="px-6">
            <Card className="bg-gradient-to-r from-accent/20 to-primary/20 border-accent/30">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-crown text-accent-foreground text-2xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-2">Premium Feature</h3>
                <p className="text-muted-foreground mb-4">
                  WPS generation is available for Premium subscribers only.
                </p>
                <Link href="/subscription">
                  <Button className="bg-accent text-accent-foreground">
                    Upgrade to Premium
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-lg font-bold">WPS Generator</h1>
              <p className="text-xs text-muted-foreground">Generate welding procedures</p>
            </div>
          </div>
          <i className="fas fa-file-export text-muted-foreground cursor-pointer"></i>
        </div>

        {/* Input Form */}
        <div className="px-6 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Project Details</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => updateFormData('projectName', e.target.value)}
                    placeholder="Enter project name"
                    data-testid="input-project-name"
                  />
                </div>

                <div>
                  <Label htmlFor="baseMaterial">Base Material *</Label>
                  <Select value={formData.baseMaterial} onValueChange={(value) => updateFormData('baseMaterial', value)}>
                    <SelectTrigger data-testid="select-base-material">
                      <SelectValue placeholder="Select base material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A36 Carbon Steel">A36 Carbon Steel</SelectItem>
                      <SelectItem value="A572 Grade 50">A572 Grade 50</SelectItem>
                      <SelectItem value="A514 HSLA">A514 HSLA</SelectItem>
                      <SelectItem value="304 Stainless Steel">304 Stainless Steel</SelectItem>
                      <SelectItem value="316L Stainless Steel">316L Stainless Steel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="thickness">Thickness (in)</Label>
                    <Input
                      id="thickness"
                      value={formData.thickness}
                      onChange={(e) => updateFormData('thickness', e.target.value)}
                      placeholder="0.25"
                      data-testid="input-thickness"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jointType">Joint Type</Label>
                    <Select value={formData.jointType} onValueChange={(value) => updateFormData('jointType', value)}>
                      <SelectTrigger data-testid="select-joint-type">
                        <SelectValue placeholder="Select joint type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Butt Joint">Butt Joint</SelectItem>
                        <SelectItem value="Fillet Weld">Fillet Weld</SelectItem>
                        <SelectItem value="Corner Joint">Corner Joint</SelectItem>
                        <SelectItem value="T-Joint">T-Joint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Welding Process</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {["GMAW", "SMAW", "GTAW", "FCAW"].map((process) => (
                      <Button
                        key={process}
                        variant={formData.process === process ? "default" : "secondary"}
                        size="sm"
                        onClick={() => updateFormData('process', process)}
                        data-testid={`button-process-${process.toLowerCase()}`}
                      >
                        {process}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="standard">Applicable Standard</Label>
                  <Select value={formData.standard} onValueChange={(value) => updateFormData('standard', value)}>
                    <SelectTrigger data-testid="select-standard">
                      <SelectValue placeholder="Select standard" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AWS D1.1">AWS D1.1 - Structural Welding Code</SelectItem>
                      <SelectItem value="ASME IX">ASME IX - Boiler and Pressure Vessel</SelectItem>
                      <SelectItem value="AWS D1.5">AWS D1.5 - Bridge Welding Code</SelectItem>
                      <SelectItem value="API 1104">API 1104 - Pipeline Welding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="w-full bg-accent text-accent-foreground"
                  data-testid="button-generate-wps"
                >
                  {generateMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <i className="fas fa-cogs mr-2"></i>
                  )}
                  Generate WPS Outline
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated WPS Preview */}
        {wpsResult && (
          <div className="px-6 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Generated WPS Outline</h3>
                  <Badge className="bg-primary text-primary-foreground">Draft</Badge>
                </div>

                <div className="space-y-4">
                  {/* WPS Header */}
                  <div className="bg-secondary/30 rounded-lg p-3">
                    <h4 className="font-semibold text-sm mb-2">WPS Identification</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">WPS No:</span> {wpsResult.result?.wpsNumber}</div>
                      <div><span className="text-muted-foreground">Revision:</span> 0</div>
                      <div><span className="text-muted-foreground">Date:</span> {new Date().toLocaleDateString()}</div>
                      <div><span className="text-muted-foreground">Standard:</span> {formData.standard}</div>
                    </div>
                  </div>

                  {/* Base Materials */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Base Materials</h4>
                    <div className="text-sm text-muted-foreground">
                      <p>{formData.baseMaterial}</p>
                      <p>Thickness: {formData.thickness}"</p>
                    </div>
                  </div>

                  {/* Filler Metal */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Filler Metal</h4>
                    <div className="text-sm text-muted-foreground">
                      <p>Classification: {wpsResult.result?.fillerMetal}</p>
                    </div>
                  </div>

                  {/* Welding Parameters */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Essential Variables</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Process: {formData.process}</p>
                      {wpsResult.result?.parameters && Object.entries(wpsResult.result.parameters).map(([key, value]: [string, any]) => (
                        <p key={key}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button variant="secondary" size="sm">
                    <i className="fas fa-edit mr-2"></i>
                    Edit Details
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground"
                    onClick={() => {
                      exportWpsPdf(wpsResult, formData);
                      toast({ title: "PDF Downloaded", description: "Your WPS document has been saved." });
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
