
import React from 'react';

interface SoundWaveVisualizationProps {
  audioLevel: number;
  isRecording: boolean;
}

const SoundWaveVisualization: React.FC<SoundWaveVisualizationProps> = ({ 
  audioLevel, 
  isRecording 
}) => {
  // Create 5 bars with different heights based on audio level
  const bars = Array.from({ length: 5 }, (_, i) => {
    const baseHeight = 4;
    const maxHeight = 20;
    const variation = Math.sin((Date.now() / 200) + i) * 0.3; // Add some variation
    const height = baseHeight + (audioLevel * maxHeight) + (variation * audioLevel * 5);
    
    return Math.max(baseHeight, Math.min(maxHeight, height));
  });

  if (!isRecording) return null;

  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 z-10">
      {bars.map((height, index) => (
        <div
          key={index}
          className="bg-primary rounded-full transition-all duration-100 ease-out"
          style={{
            width: '2px',
            height: `${height}px`,
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

export default SoundWaveVisualization;
