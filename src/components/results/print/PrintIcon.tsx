
import React from 'react';
import { 
  FileText, 
  BarChart3, 
  Target, 
  Swords, 
  DollarSign, 
  Search, 
  TrendingUp, 
  Rocket,
  Zap,
  AlertTriangle,
  Shield,
  AlertCircle,
  Star,
  Gauge,
  BookOpen,
  Lightbulb
} from 'lucide-react';

interface PrintIconProps {
  name: 'executive-summary' | 'key-insights' | 'market-analysis' | 'competition' | 
        'financial' | 'swot' | 'detailed-scores' | 'actions' | 'strengths' | 
        'weaknesses' | 'opportunities' | 'threats' | 'saturation' | 'reading-guide' | 'insight';
  size?: number;
  className?: string;
  color?: string;
}

const iconMap = {
  'executive-summary': FileText,
  'key-insights': BarChart3,
  'market-analysis': Target,
  'competition': Swords,
  'financial': DollarSign,
  'swot': Search,
  'detailed-scores': TrendingUp,
  'actions': Rocket,
  'strengths': Zap,
  'weaknesses': AlertTriangle,
  'opportunities': Star,
  'threats': Shield,
  'saturation': Gauge,
  'reading-guide': BookOpen,
  'insight': Lightbulb
};

const PrintIcon: React.FC<PrintIconProps> = ({ 
  name, 
  size = 20, 
  className = '', 
  color = 'currentColor' 
}) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent 
      size={size} 
      className={className}
      color={color}
      strokeWidth={2}
    />
  );
};

export default PrintIcon;
