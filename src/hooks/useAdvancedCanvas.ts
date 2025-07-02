
import { useState, useCallback } from 'react';
import { useCanvasDocuments } from './useCanvasDocuments';
import { detectCanvasNeed, determineCanvasAction, extractDocumentTitle, SessionState } from '@/utils/canvasDetection';

export interface AdvancedCanvasState {
  mode: 'closed' | 'compact' | 'expanded';
  documentId: string | null;
  sessionState: SessionState;
}

export const useAdvancedCanvas = (sessionId: string | null) => {
  const [canvasState, setCanvasState] = useState<AdvancedCanvasState>({
    mode: 'closed',
    documentId: null,
    sessionState: {
      priorCanvasOpen: false,
      priorCanvasId: null,
      lastMessageWasCanvasUpdate: false,
    }
  });

  const { createDocument, updateDocument, getDocument } = useCanvasDocuments();

  const handleAIResponse = useCallback(async (
    userMessage: string,
    aiResponse: string
  ): Promise<{ 
    shouldShowInChat: boolean; 
    chatMessage?: string; 
    documentId?: string;
    title?: string;
    reportType?: string;
  }> => {
    const needsCanvas = detectCanvasNeed(userMessage, aiResponse, canvasState.sessionState);
    
    if (!needsCanvas) {
      return { shouldShowInChat: true };
    }

    const decision = determineCanvasAction(userMessage, canvasState.sessionState);
    
    if (decision.action === 'createDocument') {
      const title = extractDocumentTitle(aiResponse);
      
      // Check if we already have a document with similar content to prevent duplicates
      if (canvasState.documentId) {
        const existingDoc = await getDocument(canvasState.documentId);
        if (existingDoc && existingDoc.content.length > 500 && aiResponse.length > 500) {
          // If we have substantial content in both, prefer updating over creating new
          const success = await updateDocument(canvasState.documentId, title, aiResponse, false);
          if (success) {
            return {
              shouldShowInChat: true,
              chatMessage: `I've updated your ${title} with the latest information.`,
              documentId: canvasState.documentId,
              title: title,
              reportType: decision.documentType
            };
          }
        }
      }
      
      const document = await createDocument(title, aiResponse, decision.documentType, sessionId);
      
      if (document) {
        setCanvasState(prev => ({
          mode: 'closed',
          documentId: document.id,
          sessionState: {
            priorCanvasOpen: true,
            priorCanvasId: document.id,
            lastMessageWasCanvasUpdate: false,
          }
        }));

        return {
          shouldShowInChat: true,
          chatMessage: `I've created your ${title}. You can view, edit, and export it using the canvas below.`,
          documentId: document.id,
          title: title,
          reportType: decision.documentType
        };
      }
    } else if (decision.action === 'updateDocument' && decision.documentId) {
      const title = extractDocumentTitle(aiResponse);
      const success = await updateDocument(decision.documentId, title, aiResponse, false);
      
      if (success) {
        setCanvasState(prev => ({
          ...prev,
          sessionState: {
            ...prev.sessionState,
            lastMessageWasCanvasUpdate: true,
          }
        }));

        return {
          shouldShowInChat: true,
          chatMessage: "I've updated your document with the new information.",
          documentId: decision.documentId,
          title: title,
          reportType: decision.documentType
        };
      }
    }

    return { shouldShowInChat: true };
  }, [canvasState.sessionState, canvasState.documentId, createDocument, updateDocument, getDocument, sessionId]);

  const toggleCanvasMode = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      mode: prev.mode === 'compact' ? 'expanded' : 'compact'
    }));
  }, []);

  const closeCanvas = useCallback(() => {
    setCanvasState(prev => ({
      mode: 'closed',
      documentId: null,
      sessionState: {
        priorCanvasOpen: false,
        priorCanvasId: null,
        lastMessageWasCanvasUpdate: false,
      }
    }));
  }, []);

  const openCanvas = useCallback((documentId: string) => {
    setCanvasState(prev => ({
      mode: 'compact',
      documentId,
      sessionState: {
        priorCanvasOpen: true,
        priorCanvasId: documentId,
        lastMessageWasCanvasUpdate: false,
      }
    }));
  }, []);

  return {
    canvasState,
    handleAIResponse,
    toggleCanvasMode,
    closeCanvas,
    openCanvas,
  };
};
