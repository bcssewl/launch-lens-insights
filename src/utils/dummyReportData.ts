
export const generateDummyReportData = () => {
  return {
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
    financialAnalysis: {
      startupCosts: [
        { category: "Development", amount: 75000, description: "App development and AI model training" },
        { category: "Legal", amount: 15000, description: "Incorporation, IP protection, terms" },
        { category: "Marketing", amount: 30000, description: "Initial marketing and branding" },
        { category: "Operations", amount: 20000, description: "Equipment, software licenses" },
        { category: "Contingency", amount: 10000, description: "Unexpected costs buffer" },
      ],
      operatingCosts: [
        { month: 1, total: 25000, development: 15000, marketing: 7000, operations: 3000 },
        { month: 2, total: 28000, development: 16000, marketing: 8000, operations: 4000 },
        { month: 3, total: 32000, development: 18000, marketing: 10000, operations: 4000 },
        { month: 4, total: 35000, development: 20000, marketing: 11000, operations: 4000 },
        { month: 5, total: 38000, development: 22000, marketing: 12000, operations: 4000 },
        { month: 6, total: 40000, development: 24000, marketing: 12000, operations: 4000 },
        { month: 7, total: 42000, development: 25000, marketing: 13000, operations: 4000 },
        { month: 8, total: 45000, development: 26000, marketing: 15000, operations: 4000 },
        { month: 9, total: 47000, development: 27000, marketing: 16000, operations: 4000 },
        { month: 10, total: 48000, development: 28000, marketing: 16000, operations: 4000 },
        { month: 11, total: 50000, development: 29000, marketing: 17000, operations: 4000 },
        { month: 12, total: 52000, development: 30000, marketing: 18000, operations: 4000 },
      ],
      revenueProjections: [
        { month: 1, revenue: 0, users: 0 },
        { month: 2, revenue: 500, users: 100 },
        { month: 3, revenue: 2500, users: 500 },
        { month: 4, revenue: 7500, users: 1500 },
        { month: 5, revenue: 15000, users: 3000 },
        { month: 6, revenue: 25000, users: 5000 },
        { month: 7, revenue: 37500, users: 7500 },
        { month: 8, revenue: 50000, users: 10000 },
        { month: 9, revenue: 62500, users: 12500 },
        { month: 10, revenue: 75000, users: 15000 },
        { month: 11, revenue: 87500, users: 17500 },
        { month: 12, revenue: 100000, users: 20000 },
      ],
      breakEvenAnalysis: [
        { month: 1, revenue: 0, costs: 25000, profit: -25000 },
        { month: 2, revenue: 500, costs: 28000, profit: -27500 },
        { month: 3, revenue: 2500, costs: 32000, profit: -29500 },
        { month: 4, revenue: 7500, costs: 35000, profit: -27500 },
        { month: 5, revenue: 15000, costs: 38000, profit: -23000 },
        { month: 6, revenue: 25000, costs: 40000, profit: -15000 },
        { month: 7, revenue: 37500, costs: 42000, profit: -4500 },
        { month: 8, revenue: 50000, costs: 45000, profit: 5000 },
        { month: 9, revenue: 62500, costs: 47000, profit: 15500 },
        { month: 10, revenue: 75000, costs: 48000, profit: 27000 },
        { month: 11, revenue: 87500, costs: 50000, profit: 37500 },
        { month: 12, revenue: 100000, costs: 52000, profit: 48000 },
      ],
      fundingRequirements: [
        { category: "Product Development", amount: 120000, percentage: 40, fill: "hsl(var(--primary))" },
        { category: "Marketing & Sales", amount: 90000, percentage: 30, fill: "hsl(var(--primary) / 0.8)" },
        { category: "Operations", amount: 60000, percentage: 20, fill: "hsl(var(--primary) / 0.6)" },
        { category: "Contingency", amount: 30000, percentage: 10, fill: "hsl(var(--primary) / 0.4)" },
      ],
      keyMetrics: {
        totalStartupCost: 150000,
        monthlyBurnRate: 40000,
        breakEvenMonth: 8,
        fundingNeeded: 300000,
      },
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
      { category: "Competition Level", score: 4 },
      { category: "Monetization Potential", score: 7 },
      { category: "Technical Feasibility", score: 9 },
      { category: "Team Fit (Hypothetical)", score: 7 },
    ],
    actionItems: [
      { id: 1, title: "Landing Page Test", effort: "Low", impact: "High", description: "Create a 'smoke test' landing page to gauge interest and collect emails." },
      { id: 2, title: "Customer Interviews", effort: "Medium", impact: "High", description: "Conduct 10-15 interviews with target users to validate pain points." },
      { id: 3, title: "Competitor Feature Analysis", effort: "Low", impact: "Medium", description: "Deep dive into the top 3 competitors' feature sets and UX." },
    ]
  };
};
