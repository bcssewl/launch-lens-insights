
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { ClientOnlyThemeToggle } from '@/components/ClientOnlyThemeToggle';


const PreferencesSettingsTab: React.FC = () => {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your application experience.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Theme Selection */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium">Theme Selection</h3>
           <RadioGroup defaultValue="system">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light">Light Mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark">Dark Mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system">Auto (system default)</Label>
            </div>
          </RadioGroup>
        </section>

        <Separator />

        {/* Notifications */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium">Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-analysis-complete" className="flex flex-col space-y-1">
                <span>Analysis Complete</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Get notified by email when your idea analysis is ready.
                </span>
              </Label>
              <Switch id="notif-analysis-complete" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-weekly-insights" className="flex flex-col space-y-1">
                <span>Weekly Insights</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive a weekly summary of insights and tips.
                </span>
              </Label>
              <Switch id="notif-weekly-insights" />
            </div>
             <div className="flex items-center justify-between">
              <Label htmlFor="notif-push-features" className="flex flex-col space-y-1">
                <span>New Features (Push)</span>
                <span className="font-normal leading-snug text-muted-foreground">
                 App notifications about new features and updates.
                </span>
              </Label>
              <Switch id="notif-push-features" defaultChecked disabled/>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-marketing" className="flex flex-col space-y-1">
                <span>Marketing Emails</span>
                <span className="font-normal leading-snug text-muted-foreground">
                 Receive tips, updates, and promotional offers.
                </span>
              </Label>
              <Switch id="notif-marketing" />
            </div>
          </div>
        </section>
        
        <Separator />

        {/* Analysis Preferences */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium">Analysis Preferences</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="analysis-depth">Default Analysis Depth</Label>
              <RadioGroup defaultValue="standard" id="analysis-depth" className="mt-2 flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quick" id="depth-quick" />
                  <Label htmlFor="depth-quick">Quick</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="depth-standard" />
                  <Label htmlFor="depth-standard">Standard</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comprehensive" id="depth-comprehensive" />
                  <Label htmlFor="depth-comprehensive">Comprehensive</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="report-format">Default Report Format</Label>
              <RadioGroup defaultValue="web" id="report-format" className="mt-2 flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="web" id="format-web" />
                  <Label htmlFor="format-web">Web View</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="format-pdf" />
                  <Label htmlFor="format-pdf">PDF</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="format-both" />
                  <Label htmlFor="format-both">Both</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save-reports">Auto-save Reports</Label>
              <Switch id="auto-save-reports" defaultChecked />
            </div>
          </div>
        </section>
      </CardContent>
      <CardFooter>
        <Button>Save Preferences</Button>
      </CardFooter>
    </Card>
  );
};

export default PreferencesSettingsTab;
