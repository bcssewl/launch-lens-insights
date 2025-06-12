
import React from 'react';

interface AIAvatarProps {
  isActionPlan?: boolean;
}

const AIAvatar: React.FC<AIAvatarProps> = ({ isActionPlan = false }) => {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
      isActionPlan 
        ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
        : 'bg-gradient-to-br from-primary to-primary/80'
    }`}>
      {isActionPlan ? '🎯' : '🤖'}
    </div>
  );
};

export default AIAvatar;
