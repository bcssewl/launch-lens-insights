
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, UserPlus } from 'lucide-react';

const TeamSettingsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team & Collaboration</CardTitle>
        <CardDescription>Manage your team members and collaboration settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-lg font-medium">Current Plan</h3>
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="font-semibold text-primary">Founder Plan - $49/month</p>
            <p className="text-sm text-muted-foreground">Unlimited analyses, team collaboration, priority support.</p>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Team Members</h3>
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Team Members
            </Button>
          </div>
          <div className="space-y-3">
            {/* Sample Team Member */}
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Jane Doe" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">jane@startup.com</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {/* Add more team members or an empty state here */}
            <p className="text-sm text-muted-foreground text-center py-4">
              You haven't invited any team members yet.
            </p>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h3 className="text-lg font-medium">Collaboration Settings</h3>
           <div className="flex items-center justify-between">
            <Label htmlFor="shared-reports-access" className="flex flex-col space-y-1">
                <span>Shared Reports Access</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Allow team members to view all reports by default.
                </span>
              </Label>
            <Switch id="shared-reports-access" defaultChecked />
          </div>
          {/* Add more collaboration permissions settings here if needed */}
           <p className="text-sm text-muted-foreground">More granular permissions coming soon.</p>
        </section>
      </CardContent>
      <CardFooter>
        <Button>Save Team Settings</Button>
      </CardFooter>
    </Card>
  );
};

export default TeamSettingsTab;
