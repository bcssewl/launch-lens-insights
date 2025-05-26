
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Camera } from 'lucide-react';

const AccountSettingsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Update your profile information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
          <div className="relative group">
            <Avatar className="h-24 w-24">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" className="absolute bottom-0 right-0 rounded-full bg-background/70 group-hover:bg-background transition-colors">
              <Camera className="h-5 w-5" />
              <span className="sr-only">Upload new photo</span>
            </Button>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground">Click the camera to upload a new photo.</p>
            <p className="text-xs text-muted-foreground">Recommended size: 200x200px, JPG or PNG.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" defaultValue="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" defaultValue="john@example.com" readOnly />
             <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company (Optional)</Label>
            <Input id="company" defaultValue="Startup Sensei" />
          </div>
           <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea id="bio" placeholder="Tell us a bit about yourself" defaultValue="Serial entrepreneur and startup advisor." className="min-h-[100px]" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Update Profile</Button>
      </CardFooter>
    </Card>
  );
};

export default AccountSettingsTab;
