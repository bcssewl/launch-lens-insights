
import { useState, useCallback } from 'react';

interface CanvasState {
  isOpen: boolean;
  content: string;
  messageId: string | null;
}

export const useCanvas = () => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    isOpen: false,
    content: '',
    messageId: null
  });

  const openCanvas = useCallback((messageId: string, content: string) => {
    setCanvasState({
      isOpen: true,
      content,
      messageId
    });
  }, []);

  const closeCanvas = useCallback(() => {
    setCanvasState({
      isOpen: false,
      content: '',
      messageId: null
    });
  }, []);

  const downloadCanvas = useCallback(() => {
    const blob = new Blob([canvasState.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas-content.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [canvasState.content]);

  const printCanvas = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Canvas Content</title></head>
          <body>
            <pre>${canvasState.content}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }, [canvasState.content]);

  const downloadCanvasPdf = useCallback(() => {
    // Simple implementation - for more advanced PDF generation, use jsPDF
    printCanvas();
  }, [printCanvas]);

  return {
    canvasState,
    openCanvas,
    closeCanvas,
    downloadCanvas,
    printCanvas,
    downloadCanvasPdf
  };
};
