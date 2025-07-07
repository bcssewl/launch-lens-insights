import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FilenameInputProps {
  fileName: string;
  onFileNameChange: (fileName: string) => void;
}

const FilenameInput: React.FC<FilenameInputProps> = ({
  fileName,
  onFileNameChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="filename">File Name</Label>
      <Input
        id="filename"
        value={fileName}
        onChange={(e) => onFileNameChange(e.target.value)}
        placeholder="Enter filename..."
      />
    </div>
  );
};

export default FilenameInput;