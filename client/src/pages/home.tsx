import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { User, Project, UsageTracking } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ToolCard from "@/components/ai/tool-card";
import FloatingActionButton from "@/components/common/floating-action-button";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: !!user,
  });

  const { data: usage } = useQuery<UsageTracking>({
    queryKey: ["/api/usage"],
    enabled: !!user,
  });

  useEffect(() => {
    if (!isLoading && !user) {
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
  }, [user, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="text-primary-foreground font-bold text-xl">A</div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const recentProjects = (projects || []).slice(0, 2);
  const userName = (user as User)?.firstName || 'Professional';

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">

        {/* Hero Section with Brand */}
        <div className="relative p-6 pb-4 bg-gradient-to-r from-[#4CAF50]/10 to-blue-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/attached_assets/ArcSide New and Improved BLUE LOGO (ORANGE SPARK)_20250826_195657_0001_1756232563390.png"
                alt="ArcSide Logo"
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#4CAF50] to-blue-500 bg-clip-text text-transparent">
                  ArcSide™
                </h1>
                <p className="text-sm text-muted-foreground">Professional Welding Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <i className="fas fa-bell text-muted-foreground cursor-pointer"></i>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#4CAF50] rounded-full animate-pulse"></div>
              </div>
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center border-2 border-[#4CAF50]/20">
                {(user as User)?.profileImageUrl ? (
                  <img
                    src={(user as User).profileImageUrl!}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <i className="fas fa-user text-sm text-secondary-foreground"></i>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="px-6 mb-6">
          <Card className="bg-gradient-to-r from-[#4CAF50]/5 to-blue-500/5 border-[#4CAF50]/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-2 text-foreground">
                Welcome back, {userName}! 👋
              </h2>
              <p className="text-muted-foreground mb-4">
                Your professional welding companion is ready. Explore our AI-powered tools and advanced calculators to enhance your work.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 bg-background/50 rounded-lg p-3">
                  <div className={`w-3 h-3 rounded-full ${(user as User)?.subscriptionTier === 'premium' ? 'bg-[#4CAF50]' : 'bg-muted-foreground'} animate-pulse`}></div>
                  <span className="text-sm font-medium">
                    {(user as User)?.subscriptionTier === 'premium' ? 'Premium Active' : 'Free Plan'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-background/50 rounded-lg p-3">
                  <i className="fas fa-chart-line text-[#4CAF50]"></i>
                  <span className="text-sm font-medium">
                    {(usage as UsageTracking)?.analysesCount || 0} analyses
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Section */}
        <div className="px-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fas fa-star text-[#4CAF50]"></i>
            Featured Tools
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <i className="fas fa-robot text-white text-lg"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">AI Defect Analyzer</h4>
                      <p className="text-sm text-muted-foreground">Instant weld analysis</p>
                    </div>
                  </div>
                  <Link href="/tools/defect-analyzer">
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600">Try Now</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-[#4CAF50]/20 to-emerald-500/20 border-[#4CAF50]/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#4CAF50] rounded-xl flex items-center justify-center">
                      <i className="fas fa-calculator text-white text-lg"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Smart Calculators</h4>
                      <p className="text-sm text-muted-foreground">Precise welding calculations</p>
                    </div>
                  </div>
                  <Link href="/tools">
                    <Button size="sm" className="bg-[#4CAF50] hover:bg-[#45a049]">Explore</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Tools Grid */}
        <div className="px-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">AI-Powered Tools</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/tools/defect-analyzer">
              <ToolCard
                icon="fas fa-search"
                title="Defect Analyzer"
                description="AI weld defect analysis"
                iconColor="text-primary"
                bgColor="bg-primary/20"
              />
            </Link>

            <Link href="/tools/wps-generator">
              <ToolCard
                icon="fas fa-file-alt"
                title="WPS Generator"
                description="Generate welding procedures"
                iconColor="text-accent"
                bgColor="bg-accent/20"
                premium={(user as User)?.subscriptionTier !== 'premium'}
              />
            </Link>

            <Link href="/tools/material-checker">
              <ToolCard
                icon="fas fa-layer-group"
                title="Material Check"
                description="Compatibility analysis"
                iconColor="text-secondary-foreground"
                bgColor="bg-secondary/60"
              />
            </Link>

            <Link href="/tools/terminology">
              <ToolCard
                icon="fas fa-book"
                title="Terminology"
                description="Welding terms & definitions"
                iconColor="text-chart-1"
                bgColor="bg-chart-1/20"
              />
            </Link>
          </div>
        </div>

        {/* Calculators Section */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Calculators</h3>
            <Link href="/calculators">
              <Button variant="link" size="sm" className="text-primary p-0 h-auto">
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/calculators/voltage-amperage">
              <ToolCard
                icon="fas fa-bolt"
                title="Voltage & Amperage"
                description="Calculate weld parameters"
                iconColor="text-primary"
                bgColor="bg-primary/20"
              />
            </Link>
            <Link href="/calculators/metal-weight">
              <ToolCard
                icon="fas fa-balance-scale"
                title="Metal Weight"
                description="Material weight calculator"
                iconColor="text-chart-2"
                bgColor="bg-chart-2/20"
              />
            </Link>
          </div>
        </div>

        {/* Weld Assistant Quick Access */}
        <div className="px-6 mb-6">
          <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-robot text-primary-foreground"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Weld Assistant</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ask any welding question and get expert AI guidance
                  </p>
                  <Link href="/tools/weld-assistant">
                    <Button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
                      Start Conversation
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Projects</h3>
            <Link href="/projects">
              <Button variant="link" className="text-primary p-0 h-auto text-sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {recentProjects.length > 0 ? (
              recentProjects.map((project: Project) => (
                <Card key={project.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{project.name}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(project.updatedAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {project.description || `${project.process} welding project`}
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <i className={`fas ${project.status === 'completed' ? 'fa-check-circle text-primary' : 'fa-clock text-accent'} text-xs`}></i>
                        <span className="text-xs text-muted-foreground capitalize">
                          {project.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <i className="fas fa-file text-xs text-muted-foreground"></i>
                        <span className="text-xs text-muted-foreground">
                          {project.progress || 0}% complete
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <i className="fas fa-folder-open text-2xl text-muted-foreground mb-2"></i>
                  <p className="text-sm text-muted-foreground mb-2">No projects yet</p>
                  <Link href="/projects">
                    <Button variant="outline" size="sm">Create First Project</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton />
      </div>
    </div>
  );
}