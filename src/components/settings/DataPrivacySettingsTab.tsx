
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { AlertTriangle, Download, ShieldCheck } from 'lucide-react';

const DataPrivacySettingsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data & Privacy</CardTitle>
        <CardDescription>Manage your data and privacy settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-lg font-medium">Data Export</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download My Data (JSON)
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export All Reports (PDF)
            </Button>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h3 className="text-lg font-medium">Privacy Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="public-profile" className="flex flex-col space-y-1">
                  <span>Make My Profile Public</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Allow others to see your basic profile information.
                  </span>
                </Label>
              <Switch id="public-profile" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="data-product-improvement" className="flex flex-col space-y-1">
                  <span>Allow Data for Product Improvements</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Help us improve by allowing use of anonymized data.
                  </span>
                </Label>
              <Switch id="data-product-improvement" defaultChecked />
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
          <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 space-y-3">
            <p className="text-sm text-destructive">
              Be careful! These actions are irreversible.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-destructive" /> Are you absolutely sure?
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account and all associated data, including your reports and analyses.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                   <Button type="button" variant="destructive">
                    Yes, Delete My Account
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </section>
      </CardContent>
    </Card>
  );
};

export default DataPrivacySettingsTab;
