
import React from 'react';
import ProjectSelectionModal from './ProjectSelectionModal';
import LocalFileUploader from './LocalFileUploader';

interface ChatInputModalsProps {
  showProjectModal: boolean;
  showFileUploader: boolean;
  onCloseProjectModal: () => void;
  onCloseFileUploader: () => void;
  onAttachProject: (projectId: string, projectName: string) => void;
  onAttachFile: (file: File) => void;
}

const ChatInputModals: React.FC<ChatInputModalsProps> = ({
  showProjectModal,
  showFileUploader,
  onCloseProjectModal,
  onCloseFileUploader,
  onAttachProject,
  onAttachFile,
}) => {
  return (
    <>
      <ProjectSelectionModal
        open={showProjectModal}
        onClose={onCloseProjectModal}
        onAttach={onAttachProject}
      />
      
      <LocalFileUploader
        open={showFileUploader}
        onClose={onCloseFileUploader}
        onFileSelect={onAttachFile}
      />
    </>
  );
};

export default ChatInputModals;
