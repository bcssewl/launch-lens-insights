import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PromptSlot {
  slot: string;
  content: string;
  updated_at: string;
}

const AdminPromptsPage: React.FC = () => {
  const [prompts, setPrompts] = useState<PromptSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('stratix_prompts')
        .select('*')
        .order('slot');

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Error loading prompts:', error);
      toast({
        title: "Error",
        description: "Failed to load prompts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePrompt = (slot: string, content: string) => {
    setPrompts(prev => 
      prev.map(p => p.slot === slot ? { ...p, content } : p)
    );
  };

  const savePrompt = async (slot: string) => {
    setSaving(true);
    try {
      const prompt = prompts.find(p => p.slot === slot);
      if (!prompt) return;

      const { error } = await supabase
        .from('stratix_prompts')
        .update({ content: prompt.content })
        .eq('slot', slot);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${slot} prompt updated successfully`,
      });

      await loadPrompts(); // Reload to get updated timestamps
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: "Error",
        description: "Failed to save prompt",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetPrompt = async (slot: string) => {
    const defaultPrompts = {
      core: 'You are Stratix, an elite business research consultant with access to comprehensive market intelligence. You provide precise, actionable insights backed by credible sources. Always cite every fact with specific sources. Think step-by-step through complex business problems.',
      rules: 'CONFIDENCE RULES: Require 85%+ confidence for quantitative claims. Always double-source financial data. Flag provisional data clearly. RESEARCH SCOPE: Focus on market sizing, competitive intelligence, regulatory landscape, and strategic recommendations. OUTPUT: Provide executive summaries, data tables, and clear citations.',
      style: 'TONE: Professional yet conversational, like a trusted advisor. Be direct and actionable. Use structured formatting with clear headings. Include confidence indicators (🟢 High, 🟡 Medium, 🔴 Low) for key claims. Keep responses scannable with bullet points and tables.',
      custom: ''
    };

    updatePrompt(slot, defaultPrompts[slot as keyof typeof defaultPrompts] || '');
  };

  const generatePreview = () => {
    const promptMap = Object.fromEntries(prompts.map(p => [p.slot, p.content]));
    const userQuery = "Estimate the 2028 TAM for European e-scooters and list top 5 competitors";
    
    return [
      promptMap.core || '',
      promptMap.rules || '',
      promptMap.style || '',
      promptMap.custom || '',
      `\nUser Query: ${userQuery}`
    ].filter(Boolean).join('\n\n');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Stratix Prompt Management</h1>
          <p className="text-muted-foreground">
            Configure system prompts for the Stratix research agent. Changes take effect immediately for new projects.
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Hide' : 'Show'} Assembled Prompt
          </Button>
        </div>

        {showPreview && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Assembled Prompt Preview</CardTitle>
              <CardDescription>
                This is how the final prompt looks when assembled for Stratix
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
                {generatePreview()}
              </pre>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="core" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="core">Core</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          {prompts.map((prompt) => (
            <TabsContent key={prompt.slot} value={prompt.slot}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {prompt.slot.charAt(0).toUpperCase() + prompt.slot.slice(1)} Prompt
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetPrompt(prompt.slot)}
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </Button>
                      <Button
                        onClick={() => savePrompt(prompt.slot)}
                        disabled={saving}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {getPromptDescription(prompt.slot)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`prompt-${prompt.slot}`}>Content</Label>
                      <Textarea
                        id={`prompt-${prompt.slot}`}
                        value={prompt.content}
                        onChange={(e) => updatePrompt(prompt.slot, e.target.value)}
                        placeholder={`Enter ${prompt.slot} prompt content...`}
                        className="min-h-[200px] mt-2"
                      />
                    </div>
                    {prompt.updated_at && (
                      <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(prompt.updated_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

function getPromptDescription(slot: string): string {
  switch (slot) {
    case 'core':
      return 'The base persona and identity of Stratix. Defines who Stratix is and their primary capabilities.';
    case 'rules':
      return 'Operational guidelines, confidence thresholds, and quality standards for research outputs.';
    case 'style':
      return 'Tone, voice, formatting preferences, and communication style guidelines.';
    case 'custom':
      return 'Project-specific or client-specific customizations. Overrides default behavior when needed.';
    default:
      return 'System prompt configuration';
  }
}

export default AdminPromptsPage;