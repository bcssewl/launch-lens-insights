
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  MessageCircle, 
  Trash2, 
  FileText,
  Zap,
  Database
} from 'lucide-react';
import { useAskNexus } from '@/hooks/useAskNexus';
import { ClientFile } from '@/hooks/useClientFiles';
import CacheStatsDisplay from './CacheStatsDisplay';

interface AskVaultInterfaceProps {
  file: ClientFile;
}

const AskVaultInterface: React.FC<AskVaultInterfaceProps> = ({ file }) => {
  const { 
    conversations, 
    loading, 
    loadingHistory,
    askQuestion,
    loadConversationHistory,
    clearConversations,
    getSuggestedQuestions
  } = useAskNexus({ fileId: file.id });

  const [question, setQuestion] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  useEffect(() => {
    loadConversationHistory();
    setSuggestedQuestions(getSuggestedQuestions(file.file_name, file.file_type));
  }, [file.id, loadConversationHistory, getSuggestedQuestions, file.file_name, file.file_type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const success = await askQuestion(question.trim());
    if (success) {
      setQuestion('');
    }
  };

  const handleSuggestedQuestion = (suggestedQ: string) => {
    setQuestion(suggestedQ);
  };

  const hasContent = Boolean(file.content_extracted_at && file.file_content_text);

  return (
    <div className="space-y-4">
      {/* Cache Statistics */}
      <CacheStatsDisplay fileId={file.id} />

      {/* File Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ask Questions About: {file.file_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>Content Status:</span>
            {hasContent ? (
              <Badge variant="default" className="gap-1">
                <Database className="h-3 w-3" />
                Ready for Questions
              </Badge>
            ) : (
              <Badge variant="secondary">
                Content Being Processed...
              </Badge>
            )}
          </div>

          {file.content_summary && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm"><strong>Summary:</strong> {file.content_summary}</p>
            </div>
          )}

          {file.content_keywords && file.content_keywords.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Key Topics:</p>
              <div className="flex flex-wrap gap-1">
                {file.content_keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && conversations.length === 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Suggested Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {suggestedQuestions.map((q, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto p-3"
                  onClick={() => handleSuggestedQuestion(q)}
                  disabled={!hasContent}
                >
                  {q}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation History */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Conversation History
            </CardTitle>
            {conversations.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearConversations}
                className="gap-2"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 pr-4">
            {loadingHistory ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading conversation history...
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {hasContent 
                  ? "No questions asked yet. Try asking something about this file!"
                  : "Waiting for file content to be processed..."
                }
              </div>
            ) : (
              <div className="space-y-4">
                {conversations.map((conv, index) => (
                  <div key={conv.id || index} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="bg-primary text-primary-foreground p-2 rounded-lg max-w-[80%]">
                        <p className="text-sm">{conv.question}</p>
                      </div>
                      {conv.cached && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Zap className="h-3 w-3" />
                          Cached
                        </Badge>
                      )}
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{conv.response}</p>
                    </div>
                    {index < conversations.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Question Input */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={hasContent ? "Ask a question about this file..." : "Waiting for content to be processed..."}
              disabled={loading || !hasContent}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={loading || !question.trim() || !hasContent}
              className="gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Asking...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Ask
                </>
              )}
            </Button>
          </form>
          {!hasContent && (
            <p className="text-xs text-muted-foreground mt-2">
              Content is being extracted from your file. This usually takes a few moments.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AskVaultInterface;
