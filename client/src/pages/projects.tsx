
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FolderOpen, Clock, CheckCircle, Archive, Filter } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";

const createProjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  material: z.string().optional(),
  process: z.string().optional(),
  status: z.enum(["active", "completed", "archived"]).default("active"),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

export default function Projects() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      material: "",
      process: "",
      status: "active",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateProjectForm) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Project created", description: "Your new project has been added." });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create project", variant: "destructive" });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "active":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "archived":
        return <Archive className="h-4 w-4 text-muted-foreground" />;
      default:
        return <FolderOpen className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case "archived":
        return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const filteredProjects = filter === "all"
    ? projects
    : projects.filter((p) => p.status === filter);

  const filterOptions = [
    { key: "all", label: "All", count: projects.length },
    { key: "active", label: "Active", count: projects.filter((p) => p.status === "active").length },
    { key: "completed", label: "Completed", count: projects.filter((p) => p.status === "completed").length },
    { key: "archived", label: "Archived", count: projects.filter((p) => p.status === "archived").length },
  ];

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="max-w-sm mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Projects</h1>
              <p className="text-muted-foreground">Manage your welding projects</p>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filterOptions.map((opt) => (
              <Button
                key={opt.key}
                variant={filter === opt.key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(opt.key)}
                className={`whitespace-nowrap ${filter === opt.key ? "bg-primary text-primary-foreground" : ""}`}
              >
                <Filter className="h-3 w-3 mr-1" />
                {opt.label} ({opt.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full mt-1" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-2 w-full mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Projects List */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          {getStatusIcon(project.status || "active")}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {project.description || "No description"}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className={`ml-2 ${getStatusColor(project.status || "active")}`}
                      >
                        {(project.status || "active").replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {project.process && (
                          <div>
                            <span className="text-muted-foreground">Process:</span>
                            <p className="font-medium">{project.process}</p>
                          </div>
                        )}
                        {project.material && (
                          <div>
                            <span className="text-muted-foreground">Material:</span>
                            <p className="font-medium">{project.material}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Updated:</span>
                          <p className="font-medium">
                            {new Date(project.updatedAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{project.progress || 0}%</span>
                        </div>
                        <Progress value={project.progress || 0} className="h-2" />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                        <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {filter === "all" ? "No Projects Yet" : `No ${filter} projects`}
                  </h3>
                  <p className="text-muted-foreground mb-6 text-sm">
                    {filter === "all"
                      ? "Create your first welding project to get started"
                      : `You have no projects with the "${filter}" status`}
                  </p>
                  {filter === "all" && (
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => setDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Project
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Quick Stats */}
        {!isLoading && projects.length > 0 && (
          <Card className="mt-6 bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Overview</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{projects.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-500">
                    {projects.filter((p) => p.status === "active").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">
                    {projects.filter((p) => p.status === "completed").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Done</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Bridge Repair, Pipeline Weld"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the project..."
                rows={2}
                {...form.register("description")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="process">Process</Label>
                <Input
                  id="process"
                  placeholder="e.g. SMAW, GTAW"
                  {...form.register("process")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  placeholder="e.g. A36 Steel"
                  {...form.register("material")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(val) => form.setValue("status", val as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
