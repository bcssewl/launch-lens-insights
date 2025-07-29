import React from 'react';
import { Code, Terminal } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { RainbowText } from '../RainbowText';
import { ToolCall } from '@/stores/deerFlowMessageStore';
import { useTheme } from 'next-themes';

interface PythonToolCallProps {
  toolCall: ToolCall;
}

export const PythonToolCall: React.FC<PythonToolCallProps> = ({ toolCall }) => {
  const { theme } = useTheme();
  const code = (toolCall.args as { code: string })?.code || '';
  const isExecuting = !toolCall.result && toolCall.status === 'running';
  
  return (
    <section className="mt-4 pl-4">
      <div className="font-medium italic flex items-center">
        <Code className="mr-2" size={16} />
        <RainbowText animated={isExecuting}>
          Executing Python code
        </RainbowText>
      </div>
      
      <div className="mt-2 pr-4">
        <div className="rounded-md border border-border overflow-hidden">
          <div className="bg-muted px-3 py-2 text-sm font-medium flex items-center gap-2">
            <Code size={14} />
            Code
          </div>
          <div className="overflow-x-auto">
            <SyntaxHighlighter
              language="python"
              style={theme === "dark" ? vs : tomorrow}
              customStyle={{ 
                margin: 0, 
                borderRadius: 0,
                backgroundColor: theme === "dark" ? "hsl(var(--card))" : "hsl(var(--background))"
              }}
              codeTagProps={{
                style: {
                  fontSize: '13px',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                }
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
        
        {toolCall.result && (
          <div className="mt-2 rounded-md border border-border overflow-hidden">
            <div className="bg-muted px-3 py-2 text-sm font-medium flex items-center gap-2">
              <Terminal size={14} />
              Output
            </div>
            <pre className="p-3 text-sm bg-card text-card-foreground overflow-x-auto whitespace-pre-wrap">
              {toolCall.result}
            </pre>
          </div>
        )}
        
        {toolCall.error && (
          <div className="mt-2 rounded-md border border-destructive/20 overflow-hidden">
            <div className="bg-destructive/10 px-3 py-2 text-sm font-medium flex items-center gap-2 text-destructive">
              <Terminal size={14} />
              Error
            </div>
            <pre className="p-3 text-sm bg-destructive/5 text-destructive overflow-x-auto whitespace-pre-wrap">
              {toolCall.error}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
};