import { cn } from '@/lib/utils';
import { UnifiedStreamingState } from '@/hooks/useUnifiedStreaming';
import { Button } from '@/components/ui/button';

interface ResearchBlockProps {
  className?: string;
  researchId: string | null;
  streamingState: UnifiedStreamingState;
  sendFeedback: (feedback: string) => void;
}

const ResearchBlock = ({ className, researchId, streamingState, sendFeedback }: ResearchBlockProps) => {
  if (!researchId) {
    return null;
  }

  const { citations, displayedText, progress, progressDetail, thoughtSteps, isWaitingForFeedback } = streamingState;

  return (
    <div className={cn("bg-gray-100 dark:bg-gray-800 p-4 rounded-lg", className)}>
      <h2 className="text-lg font-semibold mb-4">Research Analysis</h2>
      <div className="space-y-4">
        <p>Research ID: {researchId}</p>
        {progress < 100 && <p>Progress: {progress}% - {progressDetail}</p>}
        
        {thoughtSteps && thoughtSteps.length > 0 && (
          <div>
            <h3 className="font-semibold">Thought Process</h3>
            <ul className="list-disc list-inside">
              {thoughtSteps.map((step, index) => (
                <li key={index}>
                  <strong>{step.type}:</strong> {step.content}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isWaitingForFeedback && (
          <div className="flex space-x-2">
            <Button onClick={() => sendFeedback('approve')}>Approve</Button>
            <Button variant="destructive" onClick={() => sendFeedback('reject')}>Reject</Button>
          </div>
        )}

        <div>
          <h3 className="font-semibold">Answer</h3>
          <p>{displayedText}</p>
        </div>
        {citations && citations.length > 0 && (
          <div>
            <h3 className="font-semibold">Sources</h3>
            <ul className="list-disc list-inside">
              {citations.map((citation, index) => (
                <li key={index}>
                  <a href={citation.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {citation.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchBlock;
