
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProjectsTabContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Projects</h2>
          <p className="text-muted-foreground">Organize your ideas and reports into projects</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Mock Project Cards */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="p-2 bg-primary/10 rounded-lg mr-3">
              <Folder className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">E-commerce Platform</CardTitle>
              <p className="text-sm text-muted-foreground">3 reports • 2 ideas</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Online marketplace for handmade crafts and artisan products
            </p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                High Potential
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Tech
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="p-2 bg-primary/10 rounded-lg mr-3">
              <Folder className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Health & Wellness App</CardTitle>
              <p className="text-sm text-muted-foreground">1 report • 1 idea</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              AI-powered personal fitness and nutrition tracking application
            </p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                Medium Potential
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                Health
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="p-2 bg-primary/10 rounded-lg mr-3">
              <Folder className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">SaaS Tools Suite</CardTitle>
              <p className="text-sm text-muted-foreground">2 reports • 3 ideas</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Productivity tools for small business management and automation
            </p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                High Potential
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                SaaS
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Empty State Card */}
        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-3 bg-muted rounded-lg mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Create New Project</h3>
            <p className="text-sm text-muted-foreground text-center">
              Group related ideas and reports together
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectsTabContent;
