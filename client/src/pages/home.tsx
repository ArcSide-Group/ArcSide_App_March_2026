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
import logoPath from "@assets/image_1773535782481(2)_1774714538260.jpg";

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

        {/* Hero Section — Industrial palette */}
        <div className="relative p-5 pb-4 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={logoPath}
                alt="ArcSide Mobile App"
                className="w-14 h-14 object-contain rounded-lg shrink-0"
                data-testid="img-arcside-logo-home"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  ArcSide™
                </h1>
                <p className="text-xs text-muted-foreground">Professional Welding Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <i className="fas fa-bell text-muted-foreground cursor-pointer text-sm"></i>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center border-2 border-primary/20 shrink-0">
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

        {/* Welcome Card */}
        <div className="px-4 pt-4 mb-5">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-4">
              <h2 className="text-lg font-bold mb-1 text-foreground">
                Welcome back, {userName}! 👋
              </h2>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Your professional welding companion is ready. AI tools and precision calculators — built for the field.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 bg-background/50 rounded-lg p-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${(user as User)?.subscriptionTier === 'premium' ? 'bg-primary' : 'bg-muted-foreground'} animate-pulse`}></div>
                  <span className="text-xs font-medium truncate">
                    {(user as User)?.subscriptionTier === 'premium' ? 'Premium Active' : 'Free Plan'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-background/50 rounded-lg p-2.5">
                  <i className="fas fa-chart-line text-accent text-xs shrink-0"></i>
                  <span className="text-xs font-medium">
                    {(usage as UsageTracking)?.analysesCount || 0} analyses
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Section */}
        <div className="px-4 mb-5">
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <i className="fas fa-star text-accent text-sm"></i>
            Featured Tools
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {/* AI Defect Analyzer */}
            <Card className="bg-gradient-to-r from-primary/15 to-primary/5 border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shrink-0">
                      <i className="fas fa-camera text-primary-foreground text-base"></i>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate">AI Defect Analyzer</h4>
                      <p className="text-xs text-muted-foreground">Photo → instant weld diagnosis</p>
                    </div>
                  </div>
                  <Link href="/tools/defect-analyzer">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 h-9 px-3 text-xs font-semibold">
                      Analyze
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* WPS Generator */}
            <Card className="bg-gradient-to-r from-accent/15 to-accent/5 border-accent/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-11 h-11 bg-accent rounded-xl flex items-center justify-center shrink-0">
                      <i className="fas fa-file-contract text-accent-foreground text-base"></i>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate">WPS Generator</h4>
                      <p className="text-xs text-muted-foreground">ISO/AWS welding procedures</p>
                    </div>
                  </div>
                  <Link href="/tools/wps-generator">
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0 h-9 px-3 text-xs font-semibold">
                      Generate
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Smart Calculators */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-11 h-11 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                      <i className="fas fa-calculator text-primary text-base"></i>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate">Smart Calculators</h4>
                      <p className="text-xs text-muted-foreground">Metric precision welding math</p>
                    </div>
                  </div>
                  <Link href="/calculators">
                    <Button size="sm" variant="outline" className="shrink-0 h-9 px-3 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10">
                      Explore
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Tools Grid */}
        <div className="px-4 mb-5">
          <h3 className="text-base font-semibold mb-3">AI-Powered Tools</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/tools/defect-analyzer">
              <ToolCard
                icon="fas fa-camera"
                title="Defect Analyzer"
                description="Photo weld diagnosis"
                iconColor="text-primary"
                bgColor="bg-primary/20"
              />
            </Link>

            <Link href="/tools/wps-generator">
              <ToolCard
                icon="fas fa-file-contract"
                title="WPS Generator"
                description="ISO/AWS procedures"
                iconColor="text-accent"
                bgColor="bg-accent/20"
                premium={(user as User)?.subscriptionTier !== 'premium'}
              />
            </Link>

            <Link href="/tools/material-checker">
              <ToolCard
                icon="fas fa-atom"
                title="Material Check"
                description="Compatibility analysis"
                iconColor="text-primary"
                bgColor="bg-primary/15"
              />
            </Link>

            <Link href="/tools/terminology">
              <ToolCard
                icon="fas fa-book-open"
                title="Terminology"
                description="Welding definitions"
                iconColor="text-accent"
                bgColor="bg-accent/15"
              />
            </Link>

            <Link href="/tools/weld-assistant">
              <ToolCard
                icon="fas fa-comment-dots"
                title="Weld Assistant"
                description="AI Q&A expert"
                iconColor="text-primary"
                bgColor="bg-primary/20"
              />
            </Link>

            <Link href="/tools/process-optimizer">
              <ToolCard
                icon="fas fa-sliders-h"
                title="Optimizer"
                description="Process parameters"
                iconColor="text-accent"
                bgColor="bg-accent/20"
                premium={(user as User)?.subscriptionTier !== 'premium'}
              />
            </Link>
          </div>
        </div>

        {/* Calculators Section */}
        <div className="px-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">Calculators</h3>
            <Link href="/calculators">
              <Button variant="link" size="sm" className="text-primary p-0 h-auto text-xs">
                View All →
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/calculators/voltage-amperage">
              <ToolCard
                icon="fas fa-plug"
                title="Voltage & Amps"
                description="GMAW/SMAW/GTAW"
                iconColor="text-primary"
                bgColor="bg-primary/20"
              />
            </Link>
            <Link href="/calculators/heat-input">
              <ToolCard
                icon="fas fa-fire-alt"
                title="Heat Input"
                description="kJ/mm per ISO 13916"
                iconColor="text-accent"
                bgColor="bg-accent/20"
              />
            </Link>
            <Link href="/calculators/wire-feed-speed">
              <ToolCard
                icon="fas fa-tachometer-alt"
                title="Wire Feed Speed"
                description="mm/min for MIG/FCAW"
                iconColor="text-primary"
                bgColor="bg-primary/15"
              />
            </Link>
            <Link href="/calculators/metal-weight">
              <ToolCard
                icon="fas fa-weight-hanging"
                title="Metal Weight"
                description="kg/cm³ calculation"
                iconColor="text-accent"
                bgColor="bg-accent/15"
              />
            </Link>
          </div>
        </div>

        {/* Weld Assistant Quick Access */}
        <div className="px-4 mb-5">
          <Card className="bg-gradient-to-r from-primary/15 to-accent/10 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                  <i className="fas fa-comment-dots text-primary-foreground text-sm"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold mb-1 text-sm">AI Weld Assistant</h4>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Ask any welding question — expert AI guidance powered by Gemini 2.5 Flash
                  </p>
                  <Link href="/tools/weld-assistant">
                    <Button size="sm" className="bg-primary text-primary-foreground px-4 h-10 text-sm font-semibold">
                      Start Conversation
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <div className="px-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">Recent Projects</h3>
            <Link href="/projects">
              <Button variant="link" className="text-primary p-0 h-auto text-xs">
                View All →
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            {recentProjects.length > 0 ? (
              recentProjects.map((project: Project) => (
                <Card key={project.id} className="bg-card border-border">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-medium text-sm truncate flex-1 mr-2">{project.name}</h4>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(project.updatedAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 truncate">
                      {project.description || `${project.process} welding project`}
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <i className={`fas ${project.status === 'completed' ? 'fa-check-circle text-primary' : 'fa-clock text-accent'} text-xs`}></i>
                        <span className="text-xs text-muted-foreground capitalize">{project.status}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <i className="fas fa-file text-xs text-muted-foreground"></i>
                        <span className="text-xs text-muted-foreground">{project.progress || 0}% complete</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <i className="fas fa-folder-open text-2xl text-muted-foreground mb-2 block"></i>
                  <p className="text-sm text-muted-foreground mb-3">No projects yet</p>
                  <Link href="/projects">
                    <Button variant="outline" size="sm" className="h-10">Create First Project</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <FloatingActionButton />
      </div>
    </div>
  );
}
