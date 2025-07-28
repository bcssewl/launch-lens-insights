import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Activity,
  FileText,
  ExternalLink,
  Download,
  Copy,
  Play,
  Image as ImageIcon,
  Code,
  Search,
  Globe,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useDeerFlowStore } from "@/stores/deerFlowStore";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import ReactMarkdown from "react-markdown";
// Safe syntax highlighter component with error handling
import { Suspense } from "react";

// Fallback component for when syntax highlighting fails
const CodeBlock = ({ children, language }: { children: string; language?: string }) => (
  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto border">
    <code>{children}</code>
  </pre>
);

// Safe syntax highlighter with error boundary
const SafeSyntaxHighlighter = ({ children, language }: { children: string; language?: string }) => {
  try {
    // Use basic code block as fallback to prevent crashes
    return <CodeBlock>{children}</CodeBlock>;
  } catch (error) {
    console.warn('Syntax highlighter error:', error);
    return <CodeBlock>{children}</CodeBlock>;
  }
};

export const ResearchPanel = () => {
  const {
    isResearchPanelOpen,
    setResearchPanelOpen,
    activeResearchTab,
    setActiveResearchTab,
    researchActivities,
    reportContent,
    setReportContent,
  } = useDeerFlowStore();

  const { generatePodcast } = useStreamingChat();
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editableContent, setEditableContent] = useState(reportContent);

  if (!isResearchPanelOpen) return null;

  const handleSaveReport = () => {
    setReportContent(editableContent);
    setIsEditingReport(false);
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportContent);
    // You could add a toast notification here
  };

  const handleDownloadReport = () => {
    const blob = new Blob([reportContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "research-report.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full border-l">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <h3 className="text-lg font-semibold">Research Panel</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (reportContent) {
                generatePodcast(reportContent);
              }
            }}
            disabled={!reportContent}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setResearchPanelOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs
          value={activeResearchTab}
          onValueChange={(tab) => setActiveResearchTab(tab as "activities" | "report")}
          className="h-full"
        >
          <TabsList className="grid w-full grid-cols-2 mx-4 mb-4">
            <TabsTrigger value="activities" className="flex items-center space-x-1">
              <Activity className="h-4 w-4" />
              <span>Activities</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Report</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="p-4 h-full">
            <ActivitiesTab activities={researchActivities} />
          </TabsContent>

          <TabsContent value="report" className="p-4 h-full">
            <ReportTab
              content={reportContent}
              editableContent={editableContent}
              setEditableContent={setEditableContent}
              isEditing={isEditingReport}
              setIsEditing={setIsEditingReport}
              onSave={handleSaveReport}
              onCopy={handleCopyReport}
              onDownload={handleDownloadReport}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const ActivitiesTab = ({ activities }: { activities: any[] }) => {
  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case "web-search":
        return <Search className="h-4 w-4" />;
      case "crawl":
        return <Globe className="h-4 w-4" />;
      case "python":
        return <Code className="h-4 w-4" />;
      case "retriever":
        return <Database className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No research activities yet</p>
            <p className="text-sm">Start a conversation to see research activities here</p>
          </div>
        ) : (
          activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              toolIcon={getToolIcon(activity.toolType)}
              statusIcon={getStatusIcon(activity.status)}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
};

const ActivityCard = ({ activity, toolIcon, statusIcon }: any) => {
  const renderGitHubRepositories = (repositories: any[]) => (
    <div className="space-y-2">
      {repositories.map((repo: any, index: number) => (
        <div key={index} className="p-3 bg-muted/30 rounded-lg">
          <div className="flex gap-3">
            {repo.image_url && (
              <img 
                src={repo.image_url} 
                alt={repo.name}
                className="w-12 h-12 rounded-md object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h5 className="font-medium text-sm truncate">{repo.name}</h5>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary" className="text-xs">
                    ⭐ {repo.stars}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={repo.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {repo.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSearchResults = (results: any[]) => (
    <div className="space-y-2">
      {results.map((result: any, index: number) => (
        <div key={index} className="p-3 bg-muted/30 rounded-lg">
          <div className="flex gap-3">
            {result.image_url && (
              <img 
                src={result.image_url} 
                alt={result.title}
                className="w-12 h-12 rounded-md object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h5 className="font-medium text-sm line-clamp-2">{result.title}</h5>
                <Button variant="ghost" size="sm" asChild>
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {result.snippet}
              </p>
              {result.source && (
                <Badge variant="outline" className="text-xs mt-2">
                  {result.source}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="border-muted/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {toolIcon}
            <h4 className="font-medium">{activity.title}</h4>
          </div>
          {statusIcon}
        </div>

        <div className="space-y-3">
          {/* Handle GitHub repositories */}
          {Array.isArray(activity.content) && activity.content[0]?.name && activity.content[0]?.stars !== undefined && (
            renderGitHubRepositories(activity.content)
          )}
          
          {/* Handle search results */}
          {Array.isArray(activity.content) && activity.content[0]?.title && activity.content[0]?.snippet && (
            renderSearchResults(activity.content)
          )}

          {/* Legacy web-search results */}
          {activity.toolType === "web-search" && activity.content?.results && (
            renderSearchResults(activity.content.results)
          )}

          {activity.toolType === "crawl" && activity.content?.screenshot && (
            <div className="space-y-2">
              <img
                src={activity.content.screenshot}
                alt="Website screenshot"
                className="rounded-lg border max-w-full h-auto"
              />
              <Button variant="ghost" size="sm">
                <ImageIcon className="h-3 w-3 mr-1" />
                View Full Screenshot
              </Button>
            </div>
          )}

          {activity.toolType === "python" && activity.content?.output && (
            <div className="space-y-2">
              <SafeSyntaxHighlighter language="python">
                {activity.content.output}
              </SafeSyntaxHighlighter>
            </div>
          )}

          {activity.toolType === "retriever" && activity.content?.results && (
            <div className="space-y-2">
              {activity.content.results.map((result: any, index: number) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm">{result.content}</p>
                  <Badge variant="secondary" className="mt-2">
                    {result.source}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Generic content fallback */}
          {activity.content && 
            !Array.isArray(activity.content) && 
            !activity.content.results && 
            !activity.content.screenshot && 
            !activity.content.output && 
            typeof activity.content === 'object' && (
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
              {JSON.stringify(activity.content, null, 2)}
            </pre>
          )}
        </div>

        <Separator className="my-3" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
          <Badge variant={activity.status === "completed" ? "default" : "secondary"}>
            {activity.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

const ReportTab = ({
  content,
  editableContent,
  setEditableContent,
  isEditing,
  setIsEditing,
  onSave,
  onCopy,
  onDownload,
}: any) => {
  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Research Report</h4>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button size="sm" onClick={onSave}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={onCopy}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onDownload}>
                <Download className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {content ? (
          isEditing ? (
            <textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="w-full h-full min-h-[400px] p-4 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Edit your report here..."
            />
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No report generated yet</p>
            <p className="text-sm">Start a research conversation to generate a report</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};