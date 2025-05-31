
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface Competitor {
  id: number;
  name: string;
  description: string;
  funding: string;
  similarity: number;
}

interface CompetitionData {
  competitors: Competitor[];
  competitiveAdvantages: string[];
  marketSaturation: string;
}

interface CompetitionTabContentProps {
  data: CompetitionData;
}

const CompetitionTabContent: React.FC<CompetitionTabContentProps> = ({ data }) => {
  // Sort competitors by similarity in descending order (highest first)
  const sortedCompetitors = [...data.competitors].sort((a, b) => b.similarity - a.similarity);

  // Get market saturation content
  const getMarketSaturationContent = (saturation: string) => {
    const lowerSat = saturation.toLowerCase();
    
    if (lowerSat.includes("high")) {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        status: "🔴 High Competition",
        content: "Market shows high saturation with established players. Consider niche differentiation or unique value propositions to compete effectively.",
        badgeVariant: "destructive" as const
      };
    } else if (lowerSat.includes("medium") || lowerSat.includes("moderate")) {
      return {
        icon: <TrendingUp className="h-5 w-5 text-yellow-500" />,
        status: "🟡 Moderate Competition",
        content: "Balanced market conditions with opportunities for strategic positioning and targeted customer acquisition.",
        badgeVariant: "secondary" as const
      };
    } else if (lowerSat.includes("low")) {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        status: "🟢 Low Competition",
        content: "Favorable market conditions with limited competition. Strong opportunity for market entry and early positioning.",
        badgeVariant: "default" as const
      };
    }
    
    // Default fallback
    return {
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
      status: "📊 Market Analysis",
      content: saturation,
      badgeVariant: "outline" as const
    };
  };

  const marketSaturationInfo = getMarketSaturationContent(data.marketSaturation);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Competitor Landscape</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Funding</TableHead>
                <TableHead className="text-right">Similarity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCompetitors.map((competitor) => (
                <TableRow key={competitor.id}>
                  <TableCell className="font-medium">{competitor.name}</TableCell>
                  <TableCell>{competitor.description}</TableCell>
                  <TableCell>{competitor.funding}</TableCell>
                  <TableCell className="text-right">{(competitor.similarity * 100).toFixed(0)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Positioning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-muted flex items-center justify-center rounded-md">
              <p className="text-muted-foreground text-sm">(2x2 Market Positioning Chart Placeholder)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Potential Competitive Advantages</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {data.competitiveAdvantages.map((adv, index) => <li key={index}>{adv}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Market Saturation Card */}
      <div className="w-full bg-gradient-to-br from-card via-card to-muted/20 border border-border/50 rounded-xl p-6 shadow-sm backdrop-blur-sm">
        <div className="space-y-4">
          {/* Header with Icon */}
          <div className="flex items-center gap-3">
            {marketSaturationInfo.icon}
            <h3 className="text-lg font-semibold text-foreground">Market Saturation Analysis</h3>
          </div>
          
          {/* Main Content */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {marketSaturationInfo.content}
          </p>
          
          {/* Footer with Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-border/30">
            <span className="text-sm font-medium text-foreground">
              {marketSaturationInfo.status}
            </span>
            <Badge variant={marketSaturationInfo.badgeVariant}>
              {data.marketSaturation}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionTabContent;
