import { cn } from '@/lib/utils';
import { AlegeonStreamingStateV2 } from '@/hooks/useAlegeonStreamingV2';

interface ResearchBlockProps {
  className?: string;
  researchId: string | null;
  streamingState: AlegeonStreamingStateV2;
}

const ResearchBlock = ({ className, researchId, streamingState }: ResearchBlockProps) => {
  if (!researchId) {
    return null;
  }

  const { citations, displayedText, progress, progressDetail } = streamingState;

  return (
    <div className={cn("bg-gray-100 dark:bg-gray-800 p-4 rounded-lg", className)}>
      <h2 className="text-lg font-semibold mb-4">Research Analysis</h2>
      <div className="space-y-4">
        <p>Research ID: {researchId}</p>
        {progress < 100 && <p>Progress: {progress}% - {progressDetail}</p>}
        <div>
          <h3 className="font-semibold">Answer</h3>
          <p>{displayedText}</p>
        </div>
        {citations.length > 0 && (
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
