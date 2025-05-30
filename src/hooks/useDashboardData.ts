
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  ideasValidated: number;
  averageScore: number;
  experimentsRunning: number;
  successRate: number;
}

interface RecentActivity {
  id: string;
  ideaName: string;
  score: number;
  timestamp: string;
  statusText: string;
  statusColor: 'green' | 'yellow' | 'red';
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    ideasValidated: 0,
    averageScore: 0,
    experimentsRunning: 0,
    successRate: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch idea validations for experiments running count
      const { data: validations, error: validationsError } = await supabase
        .from('idea_validations')
        .select('id, status')
        .eq('user_id', user.id);

      if (validationsError) throw validationsError;

      // Count pending and processing validations as experiments running
      const experimentsRunning = validations?.filter(v => 
        v.status === 'pending' || v.status === 'processing'
      ).length || 0;

      // Fetch validation reports
      const { data: reports, error: reportsError } = await supabase
        .from('validation_reports')
        .select(`
          *,
          idea_validations!inner(
            id,
            idea_name,
            one_line_description,
            user_id
          )
        `)
        .eq('idea_validations.user_id', user.id)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      // Calculate stats
      const completedReports = reports?.filter(r => r.status === 'completed') || [];
      const totalReports = reports?.length || 0;
      const scores = completedReports
        .map(r => r.overall_score)
        .filter(score => score !== null) as number[];
      
      const averageScore = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

      const successRate = completedReports.length > 0
        ? (completedReports.filter(r => (r.overall_score || 0) >= 7).length / completedReports.length) * 100
        : 0;

      setStats({
        ideasValidated: totalReports,
        averageScore: Math.round(averageScore * 10) / 10,
        experimentsRunning: experimentsRunning,
        successRate: Math.round(successRate),
      });

      // Format recent activities
      const activities: RecentActivity[] = (reports || [])
        .slice(0, 5)
        .map(report => {
          const score = report.overall_score || 0;
          let statusText = 'In Progress';
          let statusColor: 'green' | 'yellow' | 'red' = 'yellow';

          if (report.status === 'completed') {
            if (score >= 7) {
              statusText = 'High Potential';
              statusColor = 'green';
            } else if (score >= 5) {
              statusText = 'Promising';
              statusColor = 'yellow';
            } else if (score >= 3) {
              statusText = 'Proceed with Caution';
              statusColor = 'yellow';
            } else {
              statusText = 'High Risk';
              statusColor = 'red';
            }
          } else if (report.status === 'failed') {
            statusText = 'Analysis Failed';
            statusColor = 'red';
          }

          return {
            id: report.id,
            ideaName: report.idea_validations?.idea_name || 'Untitled Idea',
            score: score,
            timestamp: getRelativeTime(new Date(report.created_at)),
            statusText,
            statusColor,
          };
        });

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 720) {
      const weeks = Math.floor(diffInHours / 168);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffInHours / 720);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
  };

  return {
    stats,
    recentActivities,
    loading,
    refreshData: fetchDashboardData,
  };
};
