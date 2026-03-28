import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUnits } from "@/hooks/useUnits";
import { useMutation } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import AnalysisResult from "@/components/ai/analysis-result";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { X, Download } from "lucide-react";
import { exportDefectAnalysisPdf } from "@/lib/pdf-export";

export default function DefectAnalyzer() {
  const { user } = useAuth();
  const { units } = useUnits();
  const { toast } = useToast();
  const [imageData, setImageData] = useState<string | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (data: {
      imageData: string;
      additionalDetails?: string;
    }) => {
      const response = await apiRequest("POST", "/api/ai/analyze-defect", {
        ...data,
        unitPreference: units
      });
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageData(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!imageData) {
      toast({
        title: "Missing Image",
        description: "Please upload an image of the weld defect to analyze",
        variant: "destructive",
      });
      return;
    }
    analyzeMutation.mutate({
      imageData,
      additionalDetails: additionalDetails.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 rounded-full bg-secondary/50"
              >
                <i className="fas fa-arrow-left text-sm"></i>
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Defect Analyzer</h1>
              <p className="text-xs text-muted-foreground">
                AI-powered weld analysis
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-history text-muted-foreground cursor-pointer"></i>
            <i className="fas fa-bookmark text-muted-foreground cursor-pointer"></i>
          </div>
        </div>

        {/* Usage Limit Warning for Free Users — Hidden in Beta Mode */}
        {false && (user as User)?.subscriptionTier === "free" && (
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
              {/* Image Upload Section */}
              {!imageData ? (
                <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-muted rounded-lg">
                  <label className="cursor-pointer flex flex-col items-center space-y-2">
                    <i className="fas fa-image text-muted-foreground text-3xl"></i>
                    <span className="text-sm font-medium">
                      Upload Weld Image
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Click to select or drag and drop
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      data-testid="input-image-upload"
                    />
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imageData}
                    alt="Uploaded weld defect"
                    className="w-full rounded-lg mb-3 max-h-64 object-cover"
                    data-testid="img-defect-preview"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                    onClick={() => setImageData(null)}
                    data-testid="button-remove-image"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Additional Details Section */}
              <div className="mt-4">
                <label className="text-sm font-medium">
                  Additional Details (Optional)
                </label>
                <Textarea
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  className="min-h-20 resize-none mt-2"
                  placeholder="Add extra details about the defect, welding process, materials, position, etc. to help with analysis"
                  data-testid="textarea-additional-details"
                />
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending || !imageData}
                  className="bg-primary text-primary-foreground"
                  data-testid="button-analyze"
                >
                  {analyzeMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <i className="fas fa-search mr-2"></i>
                  )}
                  Analyze Defect
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
              imageUrl={analysis.imageData}
            />
          </div>
        )}

        {/* Tips Section */}
        {!analysis && (
          <div className="px-6 mb-6">
            <h3 className="font-semibold mb-3">Tips for Best Results</h3>
            <div className="space-y-2">
              {[
                "📸 Capture the defect from multiple angles if possible",
                "💡 Ensure good lighting to see details clearly",
                "📐 Include reference objects for scale if available",
                "✍️ Add details about welding process in the notes section",
              ].map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-secondary/30 rounded-lg"
                >
                  <span className="text-sm text-muted-foreground flex-1">
                    {tip}
                  </span>
                </div>
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
              <Button
                className="bg-primary text-primary-foreground h-12"
                onClick={() => {
                  exportDefectAnalysisPdf(analysis, analysis.imageData);
                  toast({ title: "PDF Downloaded", description: "Your analysis report has been saved." });
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
