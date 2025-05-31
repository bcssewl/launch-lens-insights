
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
      <div className="container mx-auto py-8 px-4 md:px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </header>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="data_privacy">Data & Privacy</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

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
