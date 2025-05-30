
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
              {data.competitors.map((competitor) => (
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
       <Card>
        <CardHeader>
          <CardTitle>Market Saturation</CardTitle>
        </CardHeader>
        <CardContent>
           <Badge variant={data.marketSaturation.toLowerCase().includes("high") ? "destructive" : data.marketSaturation.toLowerCase().includes("medium") ? "secondary" : "default"}>
            {data.marketSaturation}
           </Badge>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitionTabContent;
