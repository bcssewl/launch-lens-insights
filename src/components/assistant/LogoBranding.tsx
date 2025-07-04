
import React from 'react';

interface LogoBrandingProps {
  onImageError: () => void;
  onImageLoad: () => void;
}

const LogoBranding: React.FC<LogoBrandingProps> = ({ onImageError, onImageLoad }) => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-center mb-6">
        <img 
          src="/lovable-uploads/27eeeb27-272a-499d-8a5b-7575fc44479f.png" 
          alt="Optivise NEXUS"
          className="h-16 w-auto"
          onError={onImageError}
          onLoad={onImageLoad}
        />
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
        Get instant insights, market analysis, and strategic advice for your startup ideas. 
        Ask anything about business validation, market research, or growth strategies.
      </p>
    </div>
  );
};

export default LogoBranding;
