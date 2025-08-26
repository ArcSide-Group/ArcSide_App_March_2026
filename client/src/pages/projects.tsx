import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string;
  material: string;
  process: string;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export default function Projects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    material: '',
    process: '',
    status: 'active'
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
    enabled: !!user,
  });

  const { toast } = useToast();

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create project');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Project created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDialogOpen(false);
      setNewProject({ name: '', description: '', material: '', process: '', status: 'active' });
    },
    onError: () => {
      toast({
        title: "Error",
        description: 'Failed to create project',
        variant: "destructive",
      });
    }
  });

  const handleCreateProject = () => {
    createProjectMutation.mutate(newProject);
  };

  const updateField = (field: string, value: string) => {
    setNewProject(prev => ({ ...prev, [field]: value }));
  };

  const filteredProjects = projects?.filter((project: Project) => {
    if (filter === 'all') return true;
    return project.status === filter;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary';
      case 'completed': return 'bg-green-500';
      case 'archived': return 'bg-muted-foreground';
      default: return 'bg-primary';
    }
  };

  const getProcessIcon = (process: string) => {
    const icons: Record<string, string> = {
      'GMAW': 'fas fa-bolt',
      'GTAW': 'fas fa-fire',
      'SMAW': 'fas fa-tools',
      'FCAW': 'fas fa-industry',
    };
    return icons[process] || 'fas fa-wrench';
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
              <h1 className="text-lg font-bold">Projects</h1>
              <p className="text-xs text-muted-foreground">Manage your welding projects</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-8 h-8 p-0 rounded-full">
                <i className="fas fa-plus text-sm"></i>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm mx-2">
              <DialogHeader>
                <DialogTitle>New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Project description..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Material</Label>
                  <Select value={newProject.material} onValueChange={(value) => updateField('material', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild-steel">Mild Steel</SelectItem>
                      <SelectItem value="stainless-steel">Stainless Steel</SelectItem>
                      <SelectItem value="aluminum">Aluminum</SelectItem>
                      <SelectItem value="carbon-steel">Carbon Steel</SelectItem>
                      <SelectItem value="cast-iron">Cast Iron</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Welding Process</Label>
                  <Select value={newProject.process} onValueChange={(value) => updateField('process', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select process" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GMAW">GMAW (MIG/MAG)</SelectItem>
                      <SelectItem value="GTAW">GTAW (TIG)</SelectItem>
                      <SelectItem value="SMAW">SMAW (Stick)</SelectItem>
                      <SelectItem value="FCAW">FCAW (Flux Core)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleCreateProject} 
                  disabled={createProjectMutation.isPending || !newProject.name}
                  className="w-full"
                >
                  {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 mb-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'completed', label: 'Completed' },
              { key: 'archived', label: 'Archived' }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={filter === tab.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(tab.key)}
                className="whitespace-nowrap"
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Projects List */}
        <div className="px-6 space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-muted-foreground mb-2"></i>
              <p className="text-sm text-muted-foreground">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-folder-open text-muted-foreground text-2xl mb-2"></i>
              <p className="text-sm text-muted-foreground">
                {filter === 'all' ? 'No projects yet' : `No ${filter} projects`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create your first project to get started
              </p>
            </div>
          ) : (
            filteredProjects.map((project: Project) => (
              <Card key={project.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center">
                      <i className={`${getProcessIcon(project.process)} text-primary text-sm`}></i>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(project.status)} text-white border-0`}
                        >
                          {project.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {project.description || 'No description provided'}
                      </p>

                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xs text-muted-foreground">
                          <i className="fas fa-cogs mr-1"></i>
                          {project.process}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          <i className="fas fa-cube mr-1"></i>
                          {project.material?.replace('-', ' ')}
                        </span>
                      </div>

                      {project.progress > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Progress</span>
                            <span className="text-xs font-medium">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-1" />
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                          Created {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <i className="fas fa-edit text-xs"></i>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <i className="fas fa-chevron-right text-xs"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Stats */}
        {!isLoading && projects && projects.length > 0 && (
          <div className="px-6 mt-6">
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-3">Project Stats</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold text-primary">{projects.length}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-500">
                      {projects.filter((p: Project) => p.status === 'active').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-chart-1">
                      {projects.filter((p: Project) => p.status === 'completed').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Done</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}