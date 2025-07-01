
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Database, Upload } from 'lucide-react';

interface AttachmentOptionsDropdownProps {
  children: React.ReactNode;
  onDatabaseSelect: () => void;
  onLocalFileSelect: () => void;
}

const AttachmentOptionsDropdown: React.FC<AttachmentOptionsDropdownProps> = ({
  children,
  onDatabaseSelect,
  onLocalFileSelect,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background border border-border shadow-lg">
        <DropdownMenuItem onClick={onDatabaseSelect} className="cursor-pointer">
          <Database className="mr-2 h-4 w-4" />
          Files from: Optivise Database
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onLocalFileSelect} className="cursor-pointer">
          <Upload className="mr-2 h-4 w-4" />
          Files stored locally
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AttachmentOptionsDropdown;
