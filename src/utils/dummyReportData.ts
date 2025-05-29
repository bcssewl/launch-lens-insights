
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
