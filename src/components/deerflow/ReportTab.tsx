import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';
import { useMessage } from '@/hooks/useOptimizedMessages';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Headphones, 
  Pencil, 
  Undo2, 
  Copy, 
  Check, 
  Download,
  Loader2,
  Save,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReportTabProps {
  researchId: string;
}

export const ReportTab = ({ researchId }: ReportTabProps) => {
  const { toast } = useToast();
  const { researchReportIds, getMessage, updateMessage } = useDeerFlowMessageStore();
  
  // Get report message ID from research session mapping
  const reportMessageId = researchReportIds.get(researchId);
  const reportMessage = reportMessageId ? getMessage(reportMessageId) : null;
  
  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  
  // Get report content and status
  const reportContent = reportMessage?.content || '';
  const isStreaming = reportMessage?.isStreaming || false;
  const isCompleted = reportMessage && !isStreaming && reportContent.length > 0;
  
  // Initialize editable content when report loads
  useEffect(() => {
    if (reportContent && !isEditing) {
      setEditableContent(reportContent);
    }
  }, [reportContent, isEditing]);
  
  // Auto-hide copy feedback
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Copy to clipboard functionality
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reportContent);
      setCopied(true);
      toast({
        title: 'Report copied to clipboard',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Failed to copy report',
        variant: 'destructive',
        duration: 2000,
      });
    }
  };

  // Download report as markdown
  const downloadReport = () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `research-report-${timestamp}.md`;
      
      const blob = new Blob([reportContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Report downloaded successfully',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Failed to download report',
        variant: 'destructive',
        duration: 2000,
      });
    }
  };

  // Generate podcast (placeholder for future implementation)
  const generatePodcast = async () => {
    setIsGeneratingPodcast(true);
    try {
      // TODO: Implement podcast generation API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: 'Podcast generation started',
        description: 'You will be notified when the podcast is ready',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Failed to generate podcast',
        variant: 'destructive',
        duration: 2000,
      });
    } finally {
      setIsGeneratingPodcast(false);
    }
  };

  // Toggle edit mode
  const toggleEdit = () => {
    if (isEditing) {
      // Confirm before discarding changes
      if (editableContent !== reportContent) {
        if (!confirm('Are you sure you want to discard your changes?')) {
          return;
        }
        setEditableContent(reportContent);
      }
    }
    setIsEditing(!isEditing);
  };

  // Save edited content
  const saveEdit = () => {
    if (reportMessageId) {
      updateMessage(reportMessageId, { content: editableContent });
      setIsEditing(false);
      toast({
        title: 'Report updated successfully',
        duration: 2000,
      });
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    if (editableContent !== reportContent) {
      if (!confirm('Are you sure you want to discard your changes?')) {
        return;
      }
    }
    setEditableContent(reportContent);
    setIsEditing(false);
  };

  // Render empty state
  if (!reportMessage || reportContent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <FileText className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No Report Generated</h3>
        <p className="text-sm text-center max-w-sm">
          Start a research conversation to generate a comprehensive report.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50">
        <h3 className="text-lg font-semibold">Research Report</h3>
        
        {isCompleted && !isEditing && (
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={generatePodcast}
                    disabled={isGeneratingPodcast}
                  >
                    {isGeneratingPodcast ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Headphones className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Generate Podcast</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" onClick={toggleEdit}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Report</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{copied ? 'Copied!' : 'Copy Report'}</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" onClick={downloadReport}>
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download as Markdown</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        )}

        {isEditing && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={cancelEdit}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={saveEdit}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-hidden">
        {isEditing ? (
          // Edit Mode
          <div className="h-full p-4">
            <textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className={cn(
                "w-full h-full p-4 border rounded-lg",
                "bg-background text-foreground",
                "resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "font-mono text-sm leading-relaxed",
                "transition-colors duration-200"
              )}
              placeholder="Edit your research report here..."
            />
          </div>
        ) : (
          // Reading Mode
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom link component for better styling
                    a: ({ href, children, ...props }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 underline transition-colors"
                        {...props}
                      >
                        {children}
                      </a>
                    ),
                    // Custom code block styling
                    pre: ({ children, ...props }) => (
                      <pre
                        className="bg-muted p-4 rounded-lg overflow-x-auto border"
                        {...props}
                      >
                        {children}
                      </pre>
                    ),
                    // Custom table styling
                    table: ({ children, ...props }) => (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-border" {...props}>
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children, ...props }) => (
                      <th className="border border-border bg-muted p-2 text-left font-semibold" {...props}>
                        {children}
                      </th>
                    ),
                    td: ({ children, ...props }) => (
                      <td className="border border-border p-2" {...props}>
                        {children}
                      </td>
                    )
                  }}
                >
                  {reportContent}
                </ReactMarkdown>
                
                {/* Streaming indicator */}
                {isStreaming && (
                  <div className="flex items-center gap-2 my-8 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Generating report...</span>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};