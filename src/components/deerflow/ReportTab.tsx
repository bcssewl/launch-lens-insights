import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Headphones, 
  Pencil, 
  Copy, 
  Check, 
  Download,
  FileDown,
  Loader2,
  Save,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LoadingAnimation } from './LoadingAnimation';
import ReportEditor from '../editor';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
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

  // Download report as PDF
  const downloadReportAsPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Create a temporary container for PDF generation
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '800px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '40px';
      tempContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      tempContainer.style.lineHeight = '1.6';
      tempContainer.style.color = '#000';
      
      // Create title
      const title = document.createElement('h1');
      title.textContent = 'Research Report';
      title.style.fontSize = '24px';
      title.style.marginBottom = '20px';
      title.style.fontWeight = 'bold';
      tempContainer.appendChild(title);
      
      // Add timestamp
      const timestampElement = document.createElement('p');
      timestampElement.textContent = `Generated on: ${new Date().toLocaleString()}`;
      timestampElement.style.fontSize = '12px';
      timestampElement.style.color = '#666';
      timestampElement.style.marginBottom = '30px';
      tempContainer.appendChild(timestampElement);
      
      // Convert markdown to HTML and add to container
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = reportContent
        .replace(/^### /gm, '<h3>')
        .replace(/^## /gm, '<h2>')
        .replace(/^# /gm, '<h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code style="background:#f4f4f4;padding:2px 4px;border-radius:3px;">$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
      
      // Wrap content in paragraphs
      contentDiv.innerHTML = '<p>' + contentDiv.innerHTML + '</p>';
      
      // Style the content
      contentDiv.style.fontSize = '14px';
      contentDiv.style.lineHeight = '1.6';
      contentDiv.querySelectorAll('h1, h2, h3').forEach(heading => {
        (heading as HTMLElement).style.marginTop = '20px';
        (heading as HTMLElement).style.marginBottom = '10px';
        (heading as HTMLElement).style.fontWeight = 'bold';
      });
      contentDiv.querySelectorAll('h1').forEach(h1 => {
        (h1 as HTMLElement).style.fontSize = '20px';
      });
      contentDiv.querySelectorAll('h2').forEach(h2 => {
        (h2 as HTMLElement).style.fontSize = '18px';
      });
      contentDiv.querySelectorAll('h3').forEach(h3 => {
        (h3 as HTMLElement).style.fontSize = '16px';
      });
      contentDiv.querySelectorAll('p').forEach(p => {
        (p as HTMLElement).style.marginBottom = '12px';
      });
      
      tempContainer.appendChild(contentDiv);
      document.body.appendChild(tempContainer);
      
      // Generate canvas from the content
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempContainer.scrollHeight
      });
      
      // Remove temporary container
      document.body.removeChild(tempContainer);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download the PDF
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `research-report-${timestamp}.pdf`;
      pdf.save(filename);
      
      toast({
        title: 'PDF downloaded successfully',
        duration: 2000,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Failed to generate PDF',
        variant: 'destructive',
        duration: 2000,
      });
    } finally {
      setIsGeneratingPDF(false);
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
    if (reportMessageId && reportMessage) {
      const updatedMessage = { ...reportMessage, content: editableContent };
      updateMessage(updatedMessage); // DeerFlow-style call
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
  if (!reportMessage) {
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

  // Debug log to check report message
  console.log('🔍 ReportTab - Report message:', {
    messageId: reportMessageId,
    content: reportContent,
    isStreaming,
    isCompleted,
    agent: reportMessage?.agent
  });

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
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={downloadReportAsPDF}
                    disabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download as PDF</TooltipContent>
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
          // Edit Mode - Rich Text Editor
          <div className="h-full p-4">
            <ReportEditor
              content={editableContent}
              onMarkdownChange={(markdown) => setEditableContent(markdown)}
            />
          </div>
        ) : (
          // Reading Mode - matching DeerFlow's simple Markdown approach
          <div className="h-full">
            <div className="w-full pt-4 pb-8 px-4">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Enhanced image component with better error handling
                    img: ({ src, alt, ...props }) => (
                      <img
                        src={src}
                        alt={alt}
                        className="max-w-full h-auto rounded-lg border shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                        {...props}
                      />
                    ),
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
                
                {/* Streaming indicator - matching DeerFlow */}
                {isStreaming && <LoadingAnimation className="my-12" />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};