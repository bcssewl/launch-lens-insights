
export interface PreviewResult {
  type: 'image' | 'text' | 'error' | 'unsupported';
  content: string;
  error?: string;
}

// Simplified preview system that relies on direct Supabase URLs
// instead of complex client-side processing

export const getFileTypeInfo = (fileType: string) => {
  console.log('Preview: Getting file type info for:', fileType);
  
  if (fileType.includes('pdf')) {
    return { type: 'pdf', canPreview: true, icon: 'FileText' };
  }
  if (fileType.includes('image')) {
    return { type: 'image', canPreview: true, icon: 'Image' };
  }
  if (fileType.includes('text') || fileType.includes('json') || fileType.includes('csv')) {
    return { type: 'text', canPreview: true, icon: 'FileCode' };
  }
  if (fileType.includes('word') || fileType.includes('document')) {
    return { type: 'document', canPreview: false, icon: 'FileText' };
  }
  if (fileType.includes('sheet') || fileType.includes('excel')) {
    return { type: 'spreadsheet', canPreview: false, icon: 'FileSpreadsheet' };
  }
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
    return { type: 'presentation', canPreview: false, icon: 'Presentation' };
  }
  
  return { type: 'unknown', canPreview: false, icon: 'File' };
};

// Legacy function maintained for backward compatibility
export const getPreviewGenerator = (fileType: string) => {
  const info = getFileTypeInfo(fileType);
  console.log('Preview: File type info:', info);
  
  // Return null for unsupported types to indicate no preview generation needed
  return info.canPreview ? () => Promise.resolve({ 
    type: 'unsupported' as const, 
    content: '',
    error: 'Use direct URL preview instead'
  }) : null;
};
