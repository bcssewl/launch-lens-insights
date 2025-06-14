
import React from 'react';
import BusinessIdeaCard, { BusinessIdea } from '@/components/business-ideas/BusinessIdeaCard';

interface BusinessIdeasGridProps {
  ideas: BusinessIdea[];
  onIdeaUpdated: () => void;
}

const BusinessIdeasGrid: React.FC<BusinessIdeasGridProps> = ({ ideas, onIdeaUpdated }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {ideas.map(idea => (
        <BusinessIdeaCard 
          key={idea.id} 
          idea={idea} 
          onIdeaUpdated={onIdeaUpdated}
        />
      ))}
    </div>
  );
};

export default BusinessIdeasGrid;
