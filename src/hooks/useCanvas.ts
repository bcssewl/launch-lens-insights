
import { useState } from 'react';

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

  const handleOpenCanvas = (messageId: string, content: string) => {
    setCanvasState({
      isOpen: true,
      content,
      messageId
    });
  };

  const handleCloseCanvas = () => {
    setCanvasState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  const handleCanvasDownload = () => {
    const blob = new Blob([canvasState.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas_content.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCanvasPrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Canvas Content</title></head>
          <body>${canvasState.content}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCanvasPdfDownload = () => {
    // Placeholder for PDF download functionality
    console.log('PDF download not implemented yet');
  };

  const updateCanvasContent = (content: string) => {
    setCanvasState(prev => ({
      ...prev,
      content
    }));
  };

  return {
    canvasState,
    handleOpenCanvas,
    handleCloseCanvas,
    handleCanvasDownload,
    handleCanvasPrint,
    handleCanvasPdfDownload,
    updateCanvasContent
  };
};
