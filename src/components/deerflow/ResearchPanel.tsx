import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Activity,
  FileText,
  Play,
  Copy,
  Download,
} from "lucide-react";
import { useDeerFlowStore } from "@/stores/deerFlowStore";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import ReactMarkdown from "react-markdown";
import { ToolCallDisplay } from "@/components/assistant/ToolCallDisplay";
import { Suspense } from "react";


export const ResearchPanel = () => {
  const store = useDeerFlowStore();
  const {
    isResearchPanelOpen,
    activeResearchTab,
    openResearchId,
    reportContent,
    messages,
    setResearchPanelOpen,
    setActiveResearchTab,
    setReportContent,
  } = store;

  const { generatePodcast } = useStreamingChat();
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editableContent, setEditableContent] = useState(reportContent);

  // Get the message that opened the research panel and extract tool calls
  const researchMessage = openResearchId ? messages.find(m => m.id === openResearchId) : null;
  const toolCalls = researchMessage?.toolCalls || [];

  if (!isResearchPanelOpen) return null;

  const handleSaveReport = () => {
    setReportContent(editableContent);
    setIsEditingReport(false);
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportContent);
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
    <Card className="h-full border-l bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
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
            className="h-8 w-8 p-0"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setResearchPanelOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-full">
        <Tabs
          value={activeResearchTab}
          onValueChange={(tab) => setActiveResearchTab(tab as "activities" | "report")}
          className="h-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 mx-4 mb-4 mt-4">
            <TabsTrigger value="activities" className="flex items-center space-x-1">
              <Activity className="h-4 w-4" />
              <span>Tool Calls</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Report</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="flex-1 px-4 pb-4">
            <ScrollArea className="h-full">
              <ToolCallDisplay toolCalls={toolCalls} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="report" className="flex-1 px-4 pb-4">
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
    <div className="h-[calc(100vh-300px)] flex flex-col">
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