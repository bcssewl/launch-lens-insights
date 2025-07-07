export interface Client {
  id: string;
  name: string;
  industry?: string;
}

export interface SaveToClientModalProps {
  open: boolean;
  onClose: () => void;
  canvasTitle: string;
  canvasContent: string;
  onSaveSuccess: (clientName: string) => void;
}