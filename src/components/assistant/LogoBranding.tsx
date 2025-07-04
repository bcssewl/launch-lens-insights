
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
          src="/lovable-uploads/97674e5d-e119-49ed-a49c-e9695dab3378.png" 
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
