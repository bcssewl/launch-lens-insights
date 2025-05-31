
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountSettingsTab from '@/components/settings/AccountSettingsTab';
import PreferencesSettingsTab from '@/components/settings/PreferencesSettingsTab';
import TeamSettingsTab from '@/components/settings/TeamSettingsTab';
import BillingSettingsTab from '@/components/settings/BillingSettingsTab';
import DataPrivacySettingsTab from '@/components/settings/DataPrivacySettingsTab';
import SupportSettingsTab from '@/components/settings/SupportSettingsTab';

const SettingsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="min-h-screen page-background">
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-primary/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-accent/20 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>
        
        <div className="relative z-10">
          <div className="container mx-auto py-8 px-4 md:px-6">
            <header className="mb-8">
              <div className="bg-white/10 backdrop-blur-md border-b border-white/10 p-6 -mx-4 md:-mx-6">
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences</p>
              </div>
            </header>

            <div className="glassmorphism-card p-6 hover-lift">
              <Tabs defaultValue="account" className="w-full">
                <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-4 -mx-6 mb-6">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 bg-white/10 backdrop-blur-sm border border-white/20">
                    <TabsTrigger value="account" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Account</TabsTrigger>
                    <TabsTrigger value="preferences" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Preferences</TabsTrigger>
                    <TabsTrigger value="team" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Team</TabsTrigger>
                    <TabsTrigger value="billing" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Billing</TabsTrigger>
                    <TabsTrigger value="data_privacy" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Data & Privacy</TabsTrigger>
                    <TabsTrigger value="support" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Support</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="account">
                  <AccountSettingsTab />
                </TabsContent>
                <TabsContent value="preferences">
                  <PreferencesSettingsTab />
                </TabsContent>
                <TabsContent value="team">
                  <TeamSettingsTab />
                </TabsContent>
                <TabsContent value="billing">
                  <BillingSettingsTab />
                </TabsContent>
                <TabsContent value="data_privacy">
                  <DataPrivacySettingsTab />
                </TabsContent>
                <TabsContent value="support">
                  <SupportSettingsTab />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
