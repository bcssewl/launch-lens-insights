
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LifeBuoy, BookOpen, MessageSquare, CalendarDays, Lightbulb, Bug } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const SupportSettingsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support & Feedback</CardTitle>
        <CardDescription>Find help, contact support, or provide feedback.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-lg font-medium">Help Resources</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-auto py-3">
              <BookOpen className="mr-3 h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">View Documentation</p>
                <p className="text-xs text-muted-foreground">Explore guides and FAQs.</p>
              </div>
            </Button>
             <Button variant="outline" className="justify-start h-auto py-3">
              <MessageSquare className="mr-3 h-5 w-5 text-primary" />
               <div className="text-left">
                <p className="font-medium">Contact Support</p>
                <p className="text-xs text-muted-foreground">Get help from our team.</p>
              </div>
            </Button>
             <Button variant="outline" className="justify-start h-auto py-3">
              <CalendarDays className="mr-3 h-5 w-5 text-primary" />
               <div className="text-left">
                <p className="font-medium">Schedule Demo Call</p>
                <p className="text-xs text-muted-foreground">Get a personalized walkthrough.</p>
              </div>
            </Button>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h3 className="text-lg font-medium">Feedback</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="default" className="flex-1">
              <Lightbulb className="mr-2 h-4 w-4" />
              Submit Feature Request
            </Button>
            <Button variant="secondary" className="flex-1">
              <Bug className="mr-2 h-4 w-4" />
              Report a Bug
            </Button>
          </div>
        </section>
      </CardContent>
    </Card>
  );
};

export default SupportSettingsTab;
