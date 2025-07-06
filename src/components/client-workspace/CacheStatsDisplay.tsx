
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, DollarSign, MessageCircle, TrendingUp } from 'lucide-react';
import { useAskNexus } from '@/hooks/useAskNexus';

interface CacheStatsDisplayProps {
  fileId: string;
}

interface CacheStats {
  totalQueries: number;
  totalUses: number;
  estimatedSavings: string;
}

const CacheStatsDisplay: React.FC<CacheStatsDisplayProps> = ({ fileId }) => {
  const { getCacheStats } = useAskNexus({ fileId });
  const [stats, setStats] = useState<CacheStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      const cacheStats = await getCacheStats();
      setStats(cacheStats);
    };

    loadStats();
  }, [getCacheStats]);

  if (!stats || stats.totalQueries === 0) {
    return null;
  }

  const cacheHitRate = stats.totalQueries > 0 
    ? ((stats.totalUses - stats.totalQueries) / stats.totalUses * 100).toFixed(1)
    : '0';

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Database className="h-4 w-4" />
          Query Cache Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MessageCircle className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-muted-foreground">Unique Queries</span>
            </div>
            <div className="text-lg font-semibold">{stats.totalQueries}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-muted-foreground">Total Uses</span>
            </div>
            <div className="text-lg font-semibold">{stats.totalUses}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Database className="h-3 w-3 text-purple-500" />
              <span className="text-xs text-muted-foreground">Cache Hit Rate</span>
            </div>
            <div className="text-lg font-semibold">{cacheHitRate}%</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-orange-500" />
              <span className="text-xs text-muted-foreground">Estimated Savings</span>
            </div>
            <div className="text-lg font-semibold">${stats.estimatedSavings}</div>
          </div>
        </div>
        
        {parseFloat(cacheHitRate) > 0 && (
          <div className="mt-3 pt-3 border-t">
            <Badge variant="secondary" className="text-xs">
              💡 Caching reduced API calls by {cacheHitRate}%
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CacheStatsDisplay;
