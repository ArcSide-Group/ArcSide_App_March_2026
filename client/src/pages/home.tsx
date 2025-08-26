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
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <div className="text-primary-foreground font-bold text-xl">A</div>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ArcSide™
              </h1>
              <p className="text-xs text-muted-foreground">Professional Welding Tools</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <i className="fas fa-bell text-muted-foreground cursor-pointer"></i>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            </div>
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              {(user as User)?.profileImageUrl ? (
                <img
                  src={(user as User).profileImageUrl!}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <i className="fas fa-user text-sm text-secondary-foreground"></i>
              )}
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="px-6 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">
                Welcome back, {userName}
              </h2>
              <p className="text-muted-foreground text-sm mb-3">
                Ready to analyze your welds? Choose a tool below to get started.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${(user as User)?.subscriptionTier === 'premium' ? 'bg-accent' : 'bg-muted-foreground'}`}></div>
                  <span className="text-xs text-muted-foreground">
                    {(user as User)?.subscriptionTier === 'premium' ? 'Premium Active' : 'Free Plan'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-clock text-xs text-muted-foreground"></i>
                  <span className="text-xs text-muted-foreground">
                    {(usage as UsageTracking)?.analysesCount || 0} analyses today
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
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