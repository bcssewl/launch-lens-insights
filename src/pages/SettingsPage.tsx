
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import AccountSettingsTab from '@/components/settings/AccountSettingsTab';
import PreferencesSettingsTab from '@/components/settings/PreferencesSettingsTab';
import TeamSettingsTab from '@/components/settings/TeamSettingsTab';
import BillingSettingsTab from '@/components/settings/BillingSettingsTab';
import DataPrivacySettingsTab from '@/components/settings/DataPrivacySettingsTab';
import SupportSettingsTab from '@/components/settings/SupportSettingsTab';

const SettingsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </header>

        <Tabs defaultValue="account" className="w-full">
          <ScrollArea className="w-full mb-6">
            <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-max">
              <TabsTrigger value="account" className="whitespace-nowrap px-3">Account</TabsTrigger>
              <TabsTrigger value="preferences" className="whitespace-nowrap px-3">Preferences</TabsTrigger>
              <TabsTrigger value="team" className="whitespace-nowrap px-3">Team</TabsTrigger>
              <TabsTrigger value="billing" className="whitespace-nowrap px-3">Billing</TabsTrigger>
              <TabsTrigger value="data_privacy" className="whitespace-nowrap px-3">Data & Privacy</TabsTrigger>
              <TabsTrigger value="support" className="whitespace-nowrap px-3">Support</TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

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
    </DashboardLayout>
  );
};

export default SettingsPage;
