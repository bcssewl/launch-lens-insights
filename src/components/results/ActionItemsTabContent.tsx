
import React from 'react';
import ActionItemCard, { ActionItem } from './ActionItemCard'; // Renamed ActionItemProps to ActionItem

interface ActionItemsTabContentProps {
  items: ActionItem[];
}

const ActionItemsTabContent: React.FC<ActionItemsTabContentProps> = ({ items }) => {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <ActionItemCard key={item.id} item={item} />
      ))}
      {items.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">No specific action items recommended at this time.</p>}
    </div>
  );
};

export default ActionItemsTabContent;
