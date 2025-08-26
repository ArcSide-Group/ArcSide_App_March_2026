
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Plus, FolderOpen, Clock, CheckCircle, AlertCircle, Filter } from "lucide-react";
import type { Project } from "@shared/schema";

const mockProjects: Project[] = [
  {
    id: "1",
    userId: "user1",
    name: "Bridge Welding Project",
    description: "Structural steel welding for highway bridge construction",
    process: "SMAW",
    material: "A36 Steel",
    thickness: 25,
    status: "in_progress",
    progress: 65,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "2",
    userId: "user1",
    name: "Pipeline Repair",
    description: "Emergency pipeline welding repair",
    process: "GTAW",
    material: "Stainless Steel 316L",
    thickness: 12,
    status: "completed",
    progress: 100,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18")
  },
  {
    id: "3",
    userId: "user1",
    name: "Tank Fabrication",
    description: "Pressure vessel welding project",
    process: "GMAW",
    material: "Carbon Steel",
    thickness: 18,
    status: "planning",
    progress: 15,
    createdAt: new Date("2024-01-22"),
    updatedAt: new Date("2024-01-22")
  }
];

export default function Projects() {
  const [filter, setFilter] = useState<string>("all");

  const { data: projects = mockProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "planning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <FolderOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "planning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredProjects = filter === "all" 
    ? projects 
    : projects.filter(project => project.status === filter);

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
            <Button className="bg-[#4CAF50] hover:bg-[#45a049] text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { key: "all", label: "All Projects", count: projects.length },
              { key: "in_progress", label: "In Progress", count: projects.filter(p => p.status === "in_progress").length },
              { key: "completed", label: "Completed", count: projects.filter(p => p.status === "completed").length },
              { key: "planning", label: "Planning", count: projects.filter(p => p.status === "planning").length }
            ].map((filterOption) => (
              <Button
                key={filterOption.key}
                variant={filter === filterOption.key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterOption.key)}
                className={`whitespace-nowrap ${filter === filterOption.key ? 'bg-[#4CAF50] text-white' : ''}`}
              >
                <Filter className="h-3 w-3 mr-1" />
                {filterOption.label} ({filterOption.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        {getStatusIcon(project.status)}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${getStatusColor(project.status)}`}
                    >
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Project Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Process:</span>
                        <p className="font-medium">{project.process}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Material:</span>
                        <p className="font-medium">{project.material}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Thickness:</span>
                        <p className="font-medium">{project.thickness}mm</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Updated:</span>
                        <p className="font-medium">
                          {new Date(project.updatedAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress || 0}%</span>
                      </div>
                      <Progress 
                        value={project.progress || 0} 
                        className="h-2"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1 bg-[#4CAF50] hover:bg-[#45a049] text-white">
                        Edit Project
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
                <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                <p className="text-muted-foreground mb-6">
                  {filter === "all" 
                    ? "Create your first welding project to get started" 
                    : `No projects with status "${filter.replace('_', ' ')}"`
                  }
                </p>
                <Button className="bg-[#4CAF50] hover:bg-[#45a049] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Stats */}
        <Card className="mt-6 bg-gradient-to-r from-[#4CAF50]/10 to-blue-500/10 border-[#4CAF50]/20">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Project Overview</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#4CAF50]">{projects.length}</p>
                <p className="text-xs text-muted-foreground">Total Projects</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">
                  {projects.filter(p => p.status === "in_progress").length}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {projects.filter(p => p.status === "completed").length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
