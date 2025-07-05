
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, File, FileText, Image, Presentation, Search, Download, Eye } from 'lucide-react';

interface ClientFileVaultProps {
  client: {
    name: string;
  };
}

const mockFiles = [
  {
    id: 1,
    name: 'Tesla Q4 Financial Report.pdf',
    type: 'pdf',
    size: '2.4 MB',
    uploadDate: '2024-12-20',
    category: 'Financial Documents',
  },
  {
    id: 2,
    name: 'Market Research Presentation.pptx',
    type: 'presentation',
    size: '8.1 MB',
    uploadDate: '2024-12-18',
    category: 'Presentations',
  },
  {
    id: 3,
    name: 'Competitive Analysis.docx',
    type: 'document',
    size: '1.2 MB',
    uploadDate: '2024-12-15',
    category: 'Research Documents',
  },
  {
    id: 4,
    name: 'Brand Guidelines.pdf',
    type: 'pdf',
    size: '5.3 MB',
    uploadDate: '2024-12-12',
    category: 'Brand Assets',
  },
  {
    id: 5,
    name: 'Market Chart Analysis.png',
    type: 'image',
    size: '892 KB',
    uploadDate: '2024-12-10',
    category: 'Charts & Graphs',
  },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'presentation':
      return <Presentation className="h-5 w-5 text-orange-500" />;
    case 'document':
      return <File className="h-5 w-5 text-blue-500" />;
    case 'image':
      return <Image className="h-5 w-5 text-green-500" />;
    default:
      return <File className="h-5 w-5 text-gray-500" />;
  }
};

const ClientFileVault: React.FC<ClientFileVaultProps> = ({ client }) => {
  return (
    <div className="space-y-6">
      {/* Header with Upload */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">File Vault</h2>
          <p className="text-muted-foreground">{mockFiles.length} files stored</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search files..." className="pl-10 w-64" />
          </div>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Drag and drop files here</h3>
          <p className="text-sm text-muted-foreground mb-4">or click to browse and upload</p>
          <Button variant="outline">Choose Files</Button>
        </CardContent>
      </Card>

      {/* File Categories */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <FileText className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="font-semibold">PDFs</div>
            <div className="text-sm text-muted-foreground">8 files</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Presentation className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="font-semibold">Presentations</div>
            <div className="text-sm text-muted-foreground">4 files</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <File className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="font-semibold">Documents</div>
            <div className="text-sm text-muted-foreground">6 files</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Image className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="font-semibold">Images</div>
            <div className="text-sm text-muted-foreground">3 files</div>
          </CardContent>
        </Card>
      </div>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {file.category} • {file.size} • {new Date(file.uploadDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Storage Info */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Used</span>
              <span>24.8 MB of 1 GB</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '2.48%' }}></div>
            </div>
            <div className="text-xs text-muted-foreground">
              Plenty of space remaining for your files
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientFileVault;
