
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface FileWithMetadata {
  file: File;
  id: string;
  category: string | null;
  suggestedTags: string[];
  confidenceScore: number;
  uploadProgress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'duplicate-choice';
  error?: string;
  previewUrl?: string;
  duplicateInfo?: {
    existingFileId: string;
    existingFileName: string;
    existingFileSize: number;
    existingUploadDate: string;
    versionCount: number;
  };
  versionChoice?: 'replace' | 'version' | null;
}

export interface EnhancedFileMetadata {
  clientId: string;
  projectId?: string;
  uploadedAt: string;
  category: string | null;
  tags: string[];
  suggestedTags: string[];
  confidenceScore: number;
  autoDetectedType: string;
  originalFilename: string;
}

export const useFileUpload = (clientId: string) => {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [duplicateFiles, setDuplicateFiles] = useState<string[]>([]);
  const { toast } = useToast();

  // Auto-tagging logic based on filename and MIME type
  const autoTagFile = useCallback((file: File): { category: string | null; tags: string[]; confidence: number } => {
    const filename = file.name.toLowerCase();
    const mimeType = file.type.toLowerCase();
    
    console.log(`Auto-tagging file: ${filename} (${mimeType})`);
    
    let category: string | null = null;
    let tags: string[] = [];
    let confidence = 0.7; // Base confidence

    // Financial document patterns
    if (filename.includes('financial') || filename.includes('budget') || 
        filename.includes('revenue') || filename.includes('invoice') ||
        filename.includes('statement') || filename.includes('tax')) {
      category = 'Financial Documents';
      tags = ['financial', 'business'];
      confidence = 0.9;
    }
    // Legal document patterns
    else if (filename.includes('contract') || filename.includes('agreement') ||
             filename.includes('legal') || filename.includes('terms') ||
             filename.includes('policy') || filename.includes('compliance')) {
      category = 'Legal';
      tags = ['legal', 'contract'];
      confidence = 0.85;
    }
    // Research patterns
    else if (filename.includes('research') || filename.includes('analysis') ||
             filename.includes('report') || filename.includes('study') ||
             filename.includes('market') || filename.includes('competitor')) {
      category = 'Research Documents';
      tags = ['research', 'analysis'];
      confidence = 0.8;
    }
    // Presentation patterns
    else if (mimeType.includes('presentation') || mimeType.includes('powerpoint') ||
             filename.includes('presentation') || filename.includes('deck') ||
             filename.includes('slides')) {
      category = 'Presentations';
      tags = ['presentation', 'slides'];
      confidence = 0.9;
    }
    // Brand/Marketing patterns
    else if (filename.includes('brand') || filename.includes('logo') ||
             filename.includes('marketing') || filename.includes('campaign') ||
             mimeType.includes('image')) {
      category = 'Brand Assets';
      tags = ['brand', 'marketing'];
      confidence = 0.75;
    }
    // Chart/Graph patterns
    else if (filename.includes('chart') || filename.includes('graph') ||
             filename.includes('data') || filename.includes('metrics') ||
             mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      category = 'Charts & Graphs';
      tags = ['data', 'analytics'];
      confidence = 0.8;
    }
    // Generic PDF handling
    else if (mimeType.includes('pdf')) {
      category = 'Research';
      tags = ['document'];
      confidence = 0.6;
    }

    // Add file type tags
    if (mimeType.includes('pdf')) tags.push('pdf');
    if (mimeType.includes('image')) tags.push('image');
    if (mimeType.includes('document')) tags.push('document');
    if (mimeType.includes('spreadsheet')) tags.push('spreadsheet');

    console.log(`Auto-tagging result: category=${category}, tags=[${tags.join(', ')}], confidence=${confidence}`);
    
    return { category, tags: [...new Set(tags)], confidence };
  }, []);

  // Check for duplicate filenames with detailed info
  const checkForDuplicates = useCallback(async (filenames: string[]) => {
    try {
      const { data, error } = await supabase
        .from('client_files')
        .select('id, file_name, file_size, upload_date, version_count, has_versions')
        .eq('client_id', clientId)
        .in('file_name', filenames);

      if (error) throw error;
      
      const duplicateMap = new Map();
      data?.forEach(file => {
        duplicateMap.set(file.file_name, {
          existingFileId: file.id,
          existingFileName: file.file_name,
          existingFileSize: file.file_size,
          existingUploadDate: file.upload_date,
          versionCount: file.version_count || 1
        });
      });
      
      const existingFilenames = data?.map(f => f.file_name) || [];
      setDuplicateFiles(existingFilenames);
      
      return duplicateMap;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return new Map();
    }
  }, [clientId]);

  // Add files to upload queue
  const addFiles = useCallback(async (newFiles: File[]) => {
    const filenames = newFiles.map(f => f.name);
    const duplicateMap = await checkForDuplicates(filenames);
    
    const filesWithMetadata: FileWithMetadata[] = newFiles.map(file => {
      const { category, tags, confidence } = autoTagFile(file);
      const duplicateInfo = duplicateMap.get(file.name);
      
      return {
        file,
        id: Math.random().toString(36).substring(7),
        category,
        suggestedTags: tags,
        confidenceScore: confidence,
        uploadProgress: 0,
        status: duplicateInfo ? 'duplicate-choice' as const : 'pending' as const,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        duplicateInfo,
        versionChoice: null
      };
    });

    setFiles(prev => [...prev, ...filesWithMetadata]);
    
    if (duplicateMap.size > 0) {
      toast({
        title: "Duplicate Files Detected",
        description: `${duplicateMap.size} file(s) already exist. Please choose how to handle them.`,
        variant: "default"
      });
    }
  }, [autoTagFile, checkForDuplicates, toast]);

  // Handle version choice for duplicate files
  const handleVersionChoice = useCallback((fileId: string, choice: 'replace' | 'version') => {
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, versionChoice: choice, status: 'pending' as const }
        : f
    ));
  }, []);

  // Create new version of existing file
  const createFileVersion = useCallback(async (originalFileId: string, newFile: File, filePath: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current version info
    const { data: currentFile, error: fetchError } = await supabase
      .from('client_files')
      .select('version_count, current_version')
      .eq('id', originalFileId)
      .single();

    if (fetchError) throw fetchError;

    const newVersionNumber = (currentFile.version_count || 1) + 1;

    // Create version record
    const { error: versionError } = await supabase
      .from('client_file_versions')
      .insert({
        parent_file_id: originalFileId,
        version_number: newVersionNumber,
        file_name: newFile.name,
        file_path: filePath,
        file_size: newFile.size,
        file_type: newFile.type,
        uploaded_by: user.id
      });

    if (versionError) throw versionError;

    // Update main file record
    const { error: updateError } = await supabase
      .from('client_files')
      .update({
        version_count: newVersionNumber,
        current_version: newVersionNumber,
        has_versions: true,
        file_path: filePath,
        file_size: newFile.size,
        upload_date: new Date().toISOString()
      })
      .eq('id', originalFileId);

    if (updateError) throw updateError;
  }, []);

  // Replace existing file (move current to version history)
  const replaceExistingFile = useCallback(async (originalFileId: string, newFile: File, filePath: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current file info to create version
    const { data: currentFile, error: fetchError } = await supabase
      .from('client_files')
      .select('*')
      .eq('id', originalFileId)
      .single();

    if (fetchError) throw fetchError;

    const newVersionNumber = (currentFile.version_count || 1) + 1;

    // Create version record for the current file
    const { error: versionError } = await supabase
      .from('client_file_versions')
      .insert({
        parent_file_id: originalFileId,
        version_number: currentFile.current_version || 1,
        file_name: currentFile.file_name,
        file_path: currentFile.file_path,
        file_size: currentFile.file_size,
        file_type: currentFile.file_type,
        uploaded_by: user.id,
        upload_date: currentFile.upload_date
      });

    if (versionError) throw versionError;

    // Update main file record with new file
    const { error: updateError } = await supabase
      .from('client_files')
      .update({
        version_count: newVersionNumber,
        current_version: newVersionNumber,
        has_versions: true,
        file_path: filePath,
        file_size: newFile.size,
        file_name: newFile.name,
        file_type: newFile.type,
        upload_date: new Date().toISOString()
      })
      .eq('id', originalFileId);

    if (updateError) throw updateError;
  }, []);

  // Update file tags
  const updateFileTags = useCallback((fileId: string, tags: string[]) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, suggestedTags: tags } : f
    ));
  }, []);

  // Update file category
  const updateFileCategory = useCallback((fileId: string, category: string | null) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, category } : f
    ));
  }, []);

  // Remove file from queue
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  // Upload all files
  const uploadFiles = useCallback(async () => {
    if (files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      for (const fileMetadata of files) {
        // Skip files waiting for version choice
        if (fileMetadata.status === 'duplicate-choice') continue;

        try {
          // Update status to uploading
          setFiles(prev => prev.map(f => 
            f.id === fileMetadata.id 
              ? { ...f, status: 'uploading' as const }
              : f
          ));

          const filePath = `${user.id}/${clientId}/${fileMetadata.file.name}`;
          
          // Upload file to storage
          const { error: uploadError } = await supabase.storage
            .from('client-files')
            .upload(filePath, fileMetadata.file);

          if (uploadError) throw uploadError;

          // Handle versioning or new file creation
          if (fileMetadata.duplicateInfo && fileMetadata.versionChoice) {
            if (fileMetadata.versionChoice === 'version') {
              await createFileVersion(fileMetadata.duplicateInfo.existingFileId, fileMetadata.file, filePath);
            } else if (fileMetadata.versionChoice === 'replace') {
              await replaceExistingFile(fileMetadata.duplicateInfo.existingFileId, fileMetadata.file, filePath);
            }
          } else {
            // Create new file record
            const { error: dbError } = await supabase
              .from('client_files')
              .insert({
                client_id: clientId,
                user_id: user.id,
                file_name: fileMetadata.file.name,
                file_type: fileMetadata.file.type,
                file_size: fileMetadata.file.size,
                file_path: filePath,
                category: fileMetadata.category
              });

            if (dbError) throw dbError;
          }

          // Update status to completed
          setFiles(prev => prev.map(f => 
            f.id === fileMetadata.id 
              ? { ...f, status: 'completed' as const, uploadProgress: 100 }
              : f
          ));

          successCount++;
        } catch (error) {
          console.error(`Error uploading ${fileMetadata.file.name}:`, error);
          
          setFiles(prev => prev.map(f => 
            f.id === fileMetadata.id 
              ? { 
                  ...f, 
                  status: 'error' as const, 
                  error: error instanceof Error ? error.message : 'Upload failed'
                }
              : f
          ));
          
          errorCount++;
        }
      }

      // Show success toast
      if (successCount > 0) {
        toast({
          title: "Files Uploaded Successfully",
          description: `${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}.`
        });
      }

    } catch (error) {
      console.error('Batch upload error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [files, clientId, toast, createFileVersion, replaceExistingFile]);

  // Clear all files
  const clearFiles = useCallback(() => {
    files.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
    setFiles([]);
    setDuplicateFiles([]);
  }, [files]);

  return {
    files,
    uploading,
    duplicateFiles,
    addFiles,
    updateFileTags,
    updateFileCategory,
    removeFile,
    uploadFiles,
    clearFiles,
    handleVersionChoice
  };
};
