import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";

export default function Projects() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    enabled: !!user,
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
    },
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary text-primary-foreground';
      case 'completed': return 'bg-chart-2 text-accent-foreground';
      case 'archived': return 'bg-muted text-muted-foreground';
      default: return 'bg-accent text-accent-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'fa-play-circle';
      case 'completed': return 'fa-check-circle';
      case 'archived': return 'fa-archive';
      default: return 'fa-clock';
    }
  };

  if (isLoading || projectsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="text-primary-foreground font-bold text-xl">A</div>
          </div>
          <p className="text-muted-foreground">Loading projects...</p>
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
              <h1 className="text-lg font-bold">Projects</h1>
              <p className="text-xs text-muted-foreground">Manage your welding projects</p>
            </div>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground w-8 h-8 p-0 rounded-full">
            <i className="fas fa-plus text-sm"></i>
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 mb-6">
          <div className="flex space-x-2 bg-secondary/30 rounded-lg p-1">
            <Button size="sm" className="flex-1 bg-primary text-primary-foreground">All</Button>
            <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground">Active</Button>
            <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground">Completed</Button>
          </div>
        </div>

        {/* Projects List */}
        <div className="px-6 mb-6 space-y-4">
          {projects && projects.length > 0 ? (
            projects.map((project: any) => (
              <Card key={project.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{project.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {project.description || `${project.process || 'Welding'} project`}
                      </p>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status || 'Active'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Material</span>
                      <p className="text-sm font-medium">{project.material || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Process</span>
                      <p className="text-sm font-medium">{project.process || 'GMAW'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <p className="text-sm font-medium">{project.progress || 0}%</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <Progress value={project.progress || 0} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <i className="fas fa-file text-xs text-muted-foreground"></i>
                        <span className="text-xs text-muted-foreground">
                          {Math.floor(Math.random() * 10) + 1} analyses
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <i className="fas fa-clock text-xs text-muted-foreground"></i>
                        <span className="text-xs text-muted-foreground">
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button variant="link" size="sm" className="text-primary p-0 h-auto">
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-folder-open text-2xl text-muted-foreground"></i>
                </div>
                <h3 className="font-semibold mb-2">No Projects Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first welding project to get started with organizing your work.
                </p>
                <Button className="bg-primary text-primary-foreground">
                  <i className="fas fa-plus mr-2"></i>
                  Create Project
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Sample projects for demonstration */}
          {(!projects || projects.length === 0) && (
            <>
              <Card className="bg-card border-border opacity-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">Pipeline Section A-12</h3>
                      <p className="text-xs text-muted-foreground">6G position pipe welding with SMAW process</p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">Active</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Material</span>
                      <p className="text-sm font-medium">API 5L X65</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Process</span>
                      <p className="text-sm font-medium">SMAW</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <p className="text-sm font-medium">75%</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <Progress value={75} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <i className="fas fa-file text-xs text-muted-foreground"></i>
                        <span className="text-xs text-muted-foreground">5 analyses</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <i className="fas fa-clock text-xs text-muted-foreground"></i>
                        <span className="text-xs text-muted-foreground">2 hours ago</span>
                      </div>
                    </div>
                    <Button variant="link" size="sm" className="text-primary p-0 h-auto">
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border opacity-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">Structural Steel Frame</h3>
                      <p className="text-xs text-muted-foreground">GMAW fillet welds for building construction</p>
                    </div>
                    <Badge className="bg-chart-2 text-accent-foreground">Completed</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Material</span>
                      <p className="text-sm font-medium">A572 Gr.50</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Process</span>
                      <p className="text-sm font-medium">GMAW</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <p className="text-sm font-medium">100%</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <Progress value={100} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <i className="fas fa-file text-xs text-muted-foreground"></i>
                        <span className="text-xs text-muted-foreground">8 analyses</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <i className="fas fa-clock text-xs text-muted-foreground"></i>
                        <span className="text-xs text-muted-foreground">Yesterday</span>
                      </div>
                    </div>
                    <Button variant="link" size="sm" className="text-primary p-0 h-auto">
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
