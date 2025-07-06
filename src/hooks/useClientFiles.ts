
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientFile {
  id: string;
  client_id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  category: string | null;
  upload_date: string;
  created_at: string;
  updated_at: string;
}

export interface FileFilters {
  fileType: string;
  dateRange: { start: Date | null; end: Date | null };
  category: string;
  search: string;
}

export const useClientFiles = (clientId: string) => {
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchFiles = async () => {
    if (!clientId) return;
    
    try {
      const { data, error } = await supabase
        .from('client_files')
        .select('*')
        .eq('client_id', clientId)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to fetch files",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, category?: string) => {
    const fileId = Math.random().toString(36).substring(7);
    setUploading(prev => [...prev, fileId]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate file path: userId/clientId/filename
      const filePath = `${user.id}/${clientId}/${file.name}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('client-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('client_files')
        .insert({
          client_id: clientId,
          user_id: user.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_path: filePath,
          category: category || getCategoryFromFileType(file.type)
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: `${file.name} uploaded successfully`
      });

      // Refresh files list
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: `Failed to upload ${file.name}`,
        variant: "destructive"
      });
    } finally {
      setUploading(prev => prev.filter(id => id !== fileId));
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const file = files.find(f => f.id === fileId);
      if (!file) return;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('client-files')
        .remove([file.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('client_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "File deleted successfully"
      });

      // Refresh files list
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive"
      });
    }
  };

  const getFileUrl = async (filePath: string) => {
    try {
      const { data } = await supabase.storage
        .from('client-files')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      return data?.signedUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  };

  const filterFiles = (filters: FileFilters) => {
    return files.filter(file => {
      // File type filter
      if (filters.fileType && filters.fileType !== 'all') {
        const fileCategory = getCategoryFromFileType(file.file_type);
        if (fileCategory !== filters.fileType) return false;
      }

      // Search filter
      if (filters.search) {
        if (!file.file_name.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
      }

      // Category filter
      if (filters.category && filters.category !== 'all') {
        if (file.category !== filters.category) return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const fileDate = new Date(file.upload_date);
        if (filters.dateRange.start && fileDate < filters.dateRange.start) return false;
        if (filters.dateRange.end && fileDate > filters.dateRange.end) return false;
      }

      return true;
    });
  };

  useEffect(() => {
    fetchFiles();
  }, [clientId]);

  return {
    files,
    loading,
    uploading,
    uploadFile,
    deleteFile,
    getFileUrl,
    filterFiles,
    refreshFiles: fetchFiles
  };
};

const getCategoryFromFileType = (fileType: string): string => {
  if (fileType.includes('pdf')) return 'PDF';
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'Presentation';
  if (fileType.includes('image')) return 'Image';
  if (fileType.includes('document') || fileType.includes('word')) return 'Document';
  return 'Other';
};
