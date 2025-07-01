
import React from 'react';

interface ChatInputStatusProps {
  error: string | null;
  isProcessing: boolean;
  isCompact: boolean;
}

const ChatInputStatus: React.FC<ChatInputStatusProps> = ({
  error,
  isProcessing,
  isCompact,
}) => {
  const containerClassName = isCompact 
    ? "mt-2 max-w-3xl mx-auto" 
    : "mt-2";

  return (
    <>
      {error && (
        <div className={`${containerClassName} text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg`}>
          {error}
        </div>
      )}
      {isProcessing && (
        <div className={`${containerClassName} text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg`}>
          Processing your voice recording...
        </div>
      )}
    </>
  );
};

export default ChatInputStatus;
