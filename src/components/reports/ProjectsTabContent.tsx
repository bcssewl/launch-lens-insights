
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ProjectsTabContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Client Workspaces</h2>
          <p className="text-muted-foreground">Manage your consulting engagements and client deliverables</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Client
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Tesla Client Card */}
        <Link to="/dashboard/client/tesla">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Tesla</CardTitle>
                <p className="text-sm text-muted-foreground">4 reports • 6 ideas</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Electric vehicle strategy and market expansion consulting
              </p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  High Potential
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Automotive
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Drip Drinks Client Card */}
        <Link to="/dashboard/client/drip-drinks">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Drip Drinks</CardTitle>
                <p className="text-sm text-muted-foreground">3 reports • 4 ideas</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Beverage brand positioning and growth strategy development
              </p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  High Potential
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  Consumer Goods
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* FinTech Startup Client Card */}
        <Link to="/dashboard/client/fintech-startup">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">FinTech Startup</CardTitle>
                <p className="text-sm text-muted-foreground">2 reports • 3 ideas</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Digital banking platform validation and market entry strategy
              </p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                  Medium Potential
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  FinTech
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Local Restaurant Chain Client Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="p-2 bg-primary/10 rounded-lg mr-3">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Local Restaurant Chain</CardTitle>
              <p className="text-sm text-muted-foreground">1 report • 2 ideas</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Expansion strategy and operational efficiency optimization
            </p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                Medium Potential
              </span>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                Hospitality
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
            <h3 className="font-semibold mb-2">Add New Client</h3>
            <p className="text-sm text-muted-foreground text-center">
              Start a new consulting engagement
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectsTabContent;
