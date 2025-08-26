import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import AnalysisResult from "@/components/ai/analysis-result";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function DefectAnalyzer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (data: { description: string }) => {
      const response = await apiRequest('POST', '/api/ai/analyze-defect', data);
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: "Defect analysis completed successfully",
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
        title: "Analysis Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!description.trim()) {
      toast({
        title: "Missing Description",
        description: "Please describe the defect you want to analyze",
        variant: "destructive",
      });
      return;
    }
    analyzeMutation.mutate({ description });
  };

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
              <h1 className="text-lg font-bold">Defect Analyzer</h1>
              <p className="text-xs text-muted-foreground">AI-powered weld analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-history text-muted-foreground cursor-pointer"></i>
            <i className="fas fa-bookmark text-muted-foreground cursor-pointer"></i>
          </div>
        </div>

        {/* Usage Limit Warning for Free Users */}
        {user?.subscriptionTier === 'free' && (
          <div className="px-6 mb-4">
            <Card className="bg-accent/10 border-accent/30">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-exclamation-triangle text-accent text-sm"></i>
                  <span className="text-sm">Free Plan: 5 analyses per day</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Input Section */}
        <div className="px-6 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Describe the Defect</h3>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24 resize-none"
                placeholder="Describe the weld defect you're observing. Include details about appearance, location, welding process, materials used, etc."
                data-testid="textarea-defect-description"
              />
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" className="text-sm">
                    <i className="fas fa-camera mr-2"></i>
                    Add Photo
                  </Button>
                  <Button variant="ghost" size="sm" className="text-sm">
                    <i className="fas fa-microphone mr-2"></i>
                    Voice Input
                  </Button>
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending || !description.trim()}
                  className="bg-primary text-primary-foreground"
                  data-testid="button-analyze"
                >
                  {analyzeMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <i className="fas fa-search mr-2"></i>
                  )}
                  Analyze
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="px-6 mb-6">
            <AnalysisResult
              title="AI Analysis Results"
              result={analysis.result}
              type="defect-analysis"
            />
          </div>
        )}

        {/* Suggested Inputs */}
        {!analysis && (
          <div className="px-6 mb-6">
            <h3 className="font-semibold mb-3">Common Defect Examples</h3>
            <div className="space-y-2">
              {[
                "I notice porosity in my GMAW weld on 1/4\" mild steel",
                "Undercut along the weld toe on overhead position",
                "Slag inclusions in my stick weld root pass",
                "Lack of fusion at the sidewall of my fillet weld"
              ].map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-3 whitespace-normal"
                  onClick={() => setDescription(example)}
                >
                  <span className="text-sm">{example}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {analysis && (
          <div className="px-6 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="h-12">
                <i className="fas fa-save mr-2"></i>
                Save Analysis
              </Button>
              <Button className="bg-primary text-primary-foreground h-12">
                <i className="fas fa-share mr-2"></i>
                Export Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
