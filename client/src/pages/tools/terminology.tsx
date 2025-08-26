import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Terminology() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [result, setResult] = useState<any>(null);

  const searchMutation = useMutation({
    mutationFn: async (data: { term: string }) => {
      const response = await apiRequest('POST', '/api/ai/search-terminology', data);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Search Complete",
        description: "Terminology search completed",
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
        title: "Search Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Missing Term",
        description: "Please enter a welding term to search",
        variant: "destructive",
      });
      return;
    }
    searchMutation.mutate({ term: searchTerm });
  };

  const handleQuickSearch = (term: string) => {
    setSearchTerm(term);
    searchMutation.mutate({ term });
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
              <h1 className="text-lg font-bold">Terminology Helper</h1>
              <p className="text-xs text-muted-foreground">Welding terms & definitions</p>
            </div>
          </div>
          <i className="fas fa-bookmark text-muted-foreground cursor-pointer"></i>
        </div>

        {/* Search Bar */}
        <div className="px-6 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    placeholder="Search welding terms..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    data-testid="input-search-term"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm"></i>
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={searchMutation.isPending}
                  data-testid="button-search"
                >
                  {searchMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-search"></i>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        {result && (
          <div className="px-6 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-chart-1/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-circle text-chart-1"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold capitalize">{searchTerm}</h3>
                    <p className="text-xs text-muted-foreground">Welding terminology</p>
                  </div>
                </div>

                {/* Definition */}
                {result.result?.definition && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2">Definition</h4>
                    <p className="text-sm text-muted-foreground">{result.result.definition}</p>
                  </div>
                )}

                {/* Types */}
                {result.result?.types && result.result.types.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2">Types</h4>
                    <div className="space-y-2">
                      {result.result.types.map((type: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-sm text-muted-foreground">{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Causes */}
                {result.result?.causes && result.result.causes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2">Common Causes</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {result.result.causes.map((cause: string, index: number) => (
                        <li key={index}>• {cause}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Related Terms */}
                {result.result?.relatedTerms && result.result.relatedTerms.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Related Terms</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.result.relatedTerms.map((term: string, index: number) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() => handleQuickSearch(term)}
                        >
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Access Categories */}
        <div className="px-6 mb-6">
          <h3 className="font-semibold mb-3">
            {result ? 'Try Another Search' : 'Browse Categories'}
          </h3>
          
          {!result && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Card className="bg-card border-border cursor-pointer hover:bg-secondary/20 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <i className="fas fa-exclamation-triangle text-destructive text-sm"></i>
                    <span className="font-medium text-sm">Defects</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Discontinuities and flaws</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border cursor-pointer hover:bg-secondary/20 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <i className="fas fa-cogs text-primary text-sm"></i>
                    <span className="font-medium text-sm">Processes</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Welding methods</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border cursor-pointer hover:bg-secondary/20 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <i className="fas fa-cube text-accent text-sm"></i>
                    <span className="font-medium text-sm">Materials</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Base metals & fillers</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border cursor-pointer hover:bg-secondary/20 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <i className="fas fa-ruler text-chart-1 text-sm"></i>
                    <span className="font-medium text-sm">Testing</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Inspection methods</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Popular Terms */}
          <div>
            <h4 className="font-medium mb-2 text-sm">Popular Terms</h4>
            <div className="flex flex-wrap gap-2">
              {[
                "Porosity", "Undercut", "Root Pass", "Cap Pass", 
                "HAZ", "Penetration", "Slag Inclusion", "Lack of Fusion"
              ].map(term => (
                <Badge 
                  key={term} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
                  onClick={() => handleQuickSearch(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
