
import React from 'react';
import ActionItemCard, { ActionItem } from './ActionItemCard'; // Renamed ActionItemProps to ActionItem

interface ActionItemsTabContentProps {
  items: ActionItem[];
}

const ActionItemsTabContent: React.FC<ActionItemsTabContentProps> = ({ items }) => {
  // Sort function to prioritize lowest effort and highest impact
  const sortActionItems = (items: ActionItem[]) => {
    return [...items].sort((a, b) => {
      // Define priority values for effort (lower is better)
      const effortPriority = { low: 1, medium: 2, high: 3 };
      // Define priority values for impact (higher is better)
      const impactPriority = { low: 1, medium: 2, high: 3 };
      
      const aEffortScore = effortPriority[a.effort.toLowerCase() as keyof typeof effortPriority] || 2;
      const bEffortScore = effortPriority[b.effort.toLowerCase() as keyof typeof effortPriority] || 2;
      const aImpactScore = impactPriority[a.impact.toLowerCase() as keyof typeof impactPriority] || 2;
      const bImpactScore = impactPriority[b.impact.toLowerCase() as keyof typeof impactPriority] || 2;
      
      // Calculate combined score (lower effort + higher impact = better)
      const aScore = aEffortScore - aImpactScore;
      const bScore = bEffortScore - bImpactScore;
      
      return aScore - bScore;
    });
  };

  const sortedItems = sortActionItems(items);

  return (
    <div className="space-y-4">
      {sortedItems.map((item) => (
        <ActionItemCard key={item.id} item={item} />
      ))}
      {items.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">No specific action items recommended at this time.</p>}
    </div>
  );
};

export default ActionItemsTabContent;
