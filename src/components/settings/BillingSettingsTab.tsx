
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';

const billingHistory = [
  { date: "December 1, 2023", amount: "$49.00", status: "Paid", invoice: "#INV12345" },
  { date: "November 1, 2023", amount: "$49.00", status: "Paid", invoice: "#INV12344" },
  { date: "October 1, 2023", amount: "$49.00", status: "Paid", invoice: "#INV12343" },
];

const BillingSettingsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>Manage your subscription, payment methods, and view billing history.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-lg font-medium">Current Subscription</h3>
          <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
            <p><span className="font-semibold">Plan:</span> Founder Plan</p>
            <p><span className="font-semibold">Price:</span> $49/month</p>
            <p><span className="font-semibold">Next Billing Date:</span> January 15, 2024</p>
             <div className="flex space-x-2 pt-2">
              <Button variant="outline">Change Plan</Button>
              <Button variant="destructive">Cancel Subscription</Button>
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h3 className="text-lg font-medium">Usage This Month</h3>
           <div className="space-y-2">
            <p>7 of Unlimited analyses used</p>
            <Progress value={70} className="w-full" /> {/* Assuming 70% for visual representation, adjust as needed */}
            <Button variant="link" className="p-0 h-auto text-sm">View detailed usage</Button>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h3 className="text-lg font-medium">Billing History</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((item) => (
                <TableRow key={item.invoice}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.amount}</TableCell>
                  <TableCell><span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full dark:bg-green-900 dark:text-green-300">{item.status}</span></TableCell>
                  <TableCell><Button variant="link" className="p-0 h-auto text-sm">{item.invoice}</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Update Payment Method</Button>
      </CardFooter>
    </Card>
  );
};

export default BillingSettingsTab;
