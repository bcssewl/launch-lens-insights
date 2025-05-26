
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Download, MessageSquare, PlusCircle, Save } from 'lucide-react';

import ResultsHeader from '@/components/results/ResultsHeader';
import OverviewTabContent from '@/components/results/OverviewTabContent';
import MarketAnalysisTabContent from '@/components/results/MarketAnalysisTabContent';
import CompetitionTabContent from '@/components/results/CompetitionTabContent';
import SWOTAnalysisTabContent from '@/components/results/SWOTAnalysisTabContent';
import DetailedScoresTabContent from '@/components/results/DetailedScoresTabContent';
import ActionItemsTabContent from '@/components/results/ActionItemsTabContent';

// Placeholder data for the report
const reportData = {
  ideaName: "AI-Powered Recipe Generator",
  score: 7.2,
  recommendation: "PROCEED WITH CAUTION",
  analysisDate: "May 26, 2025",
  executiveSummary: "An AI-powered recipe generator that suggests meals based on available ingredients, dietary restrictions, and user preferences. Shows moderate potential with a clear value proposition but faces a competitive landscape.",
  keyMetrics: {
    marketSize: { value: "$2.3B", label: "TAM" },
    competitionLevel: { value: "High", subValue: "24 competitors" },
    problemClarity: { value: "Strong" },
    revenuePotential: { value: "Moderate" },
  },
  marketAnalysis: {
    tamSamSom: [
      { name: 'TAM', value: 2300, fill: 'hsl(var(--primary))' },
      { name: 'SAM', value: 1200, fill: 'hsl(var(--primary) / 0.8)' },
      { name: 'SOM', value: 300, fill: 'hsl(var(--primary) / 0.6)' },
    ],
    marketGrowth: [
      { year: '2021', growth: 8 }, { year: '2022', growth: 10 },
      { year: '2023', growth: 12 }, { year: '2024', growth: 15 },
      { year: '2025', growth: 18 },
    ],
    customerSegments: [
      { name: 'Busy Professionals', value: 40, fill: 'hsl(var(--primary))' },
      { name: 'Health Conscious', value: 30, fill: 'hsl(var(--primary) / 0.8)' },
      { name: 'Students', value: 20, fill: 'hsl(var(--primary) / 0.6)' },
      { name: 'Families', value: 10, fill: 'hsl(var(--primary) / 0.4)' },
    ],
    geographicOpportunity: [
      { name: 'North America', value: 60 }, { name: 'Europe', value: 25 },
      { name: 'Asia', value: 10 }, { name: 'Other', value: 5 },
    ],
  },
  competition: {
    competitors: [
      { id: 1, name: "RecipeMaster AI", description: "Similar AI recipe suggestion.", funding: "Seed", similarity: 85 },
      { id: 2, name: "CookBot", description: "Chatbot based recipe finder.", funding: "Series A", similarity: 70 },
      { id: 3, name: "KitchenPal", description: "Ingredient management & recipes.", funding: "Bootstrapped", similarity: 60 },
      { id: 4, name: "Yummly", description: "Large recipe database with search.", funding: "Acquired", similarity: 50 },
    ],
    competitiveAdvantages: ["Personalized AI", "Focus on dietary needs", "Potential for meal planning integration"],
    marketSaturation: "Medium-High",
  },
  swot: {
    strengths: ["Clear problem-solution fit", "Large addressable market", "Scalable tech"],
    weaknesses: ["Crowded market", "High customer acquisition cost", "Relies on complex AI"],
    opportunities: ["Partnerships with grocery delivery", "Untapped niche dietary markets", "Subscription model potential"],
    threats: ["Big Tech entering space", "Changing food trends", "Data privacy concerns"],
  },
  detailedScores: [
    { category: "Problem Clarity", score: 8 },
    { category: "Market Size", score: 6 },
    { category: "Competition Level", score: 4 }, // Lower is better here
    { category: "Monetization Potential", score: 7 },
    { category: "Technical Feasibility", score: 9 },
    { category: "Team Fit (Hypothetical)", score: 7 },
  ],
  actionItems: [
    { id:1, title: "Landing Page Test", effort: "Low", impact: "High", description: "Create a 'smoke test' landing page to gauge interest and collect emails." },
    { id:2, title: "Customer Interviews", effort: "Medium", impact: "High", description: "Conduct 10-15 interviews with target users to validate pain points." },
    { id:3, title: "Competitor Feature Analysis", effort: "Low", impact: "Medium", description: "Deep dive into the top 3 competitors' feature sets and UX." },
  ]
};


const ResultsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        <ResultsHeader 
          ideaName={reportData.ideaName}
          score={reportData.score}
          recommendationText={reportData.recommendation}
          analysisDate={reportData.analysisDate}
        />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="competition">Competition</TabsTrigger>
            <TabsTrigger value="swot">SWOT</TabsTrigger>
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <OverviewTabContent 
              summary={reportData.executiveSummary}
              metrics={reportData.keyMetrics}
            />
          </TabsContent>
          <TabsContent value="market" className="mt-4">
            <MarketAnalysisTabContent data={reportData.marketAnalysis} />
          </TabsContent>
          <TabsContent value="competition" className="mt-4">
            <CompetitionTabContent data={reportData.competition} />
          </TabsContent>
          <TabsContent value="swot" className="mt-4">
            <SWOTAnalysisTabContent data={reportData.swot} />
          </TabsContent>
          <TabsContent value="scores" className="mt-4">
            <DetailedScoresTabContent scores={reportData.detailedScores} />
          </TabsContent>
          <TabsContent value="actions" className="mt-4">
            <ActionItemsTabContent items={reportData.actionItems} />
          </TabsContent>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-2 justify-end pt-6 border-t mt-6">
          <Button variant="outline"><Download className="mr-2" /> Download PDF</Button>
          <Button variant="outline"><MessageSquare className="mr-2" /> Ask AI Follow-up</Button>
          <Button><Save className="mr-2" /> Save to My Reports</Button>
          <Button variant="secondary"><PlusCircle className="mr-2" /> Start New Analysis</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResultsPage;
