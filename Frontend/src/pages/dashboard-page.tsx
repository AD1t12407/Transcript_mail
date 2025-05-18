import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layouts/app-layout';
import { FileUploader } from '@/components/file-uploader';
import { TranscriptFile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  MessageSquare, 
  Mail,
  ChevronRight,
  UploadCloud,
  Clock,
  Download,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function DashboardPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<TranscriptFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<TranscriptFile | null>(null);
  
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const data = await api.getRecentTranscripts();
        setFiles(data);
        
        // Auto-select the first file if available
        if (data.length > 0 && !selectedFile) {
          setSelectedFile(data[0]);
        }
      } catch (error) {
        toast.error('Failed to fetch transcripts');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFiles();
  }, []);
  
  const handleFileUploaded = (file: TranscriptFile) => {
    setFiles(prev => [file, ...prev]);
    setSelectedFile(file);
  };
  
  return (
    <AppLayout>
      <div className="w-full space-y-6 py-6">
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Upload a conversation transcript to get insights and professional email drafts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild className="hidden sm:flex">
              <a href="https://docs.example.com/help" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Documentation
              </a>
            </Button>
            <Button variant="ghost">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </section>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-5 w-full">
          <Card className="md:col-span-1 w-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UploadCloud className="h-5 w-5 mr-2 text-primary" />
                Upload Transcript
              </CardTitle>
              <CardDescription>
                Upload a PDF or text file to process and analyze
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader onFileUploaded={handleFileUploaded} />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-4 w-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Recent Transcripts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                  <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No transcripts yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload your first transcript to get started
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 p-2">
                    {files.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        className={cn(
                          "relative flex items-center rounded-md border p-3 w-full text-left transition-colors",
                          selectedFile?.id === file.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted"
                        )}
                      >
                        <FileText className="h-5 w-5 mr-3 text-primary" />
                        <div className="flex-1 truncate">
                          <p className="font-medium">{file.filename}</p>
                          <div className="flex items-center mt-1">
                            <p className="text-xs text-muted-foreground mr-2">
                              {format(new Date(file.uploadedAt), 'MMM d, yyyy')}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {file.status}
                            </Badge>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
        
        {selectedFile && (
          <div className="grid gap-6 md:grid-cols-2 w-full">
            <Card className="bg-primary/5 border-primary/20 w-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Conversation Insights
                </CardTitle>
                <CardDescription>
                  Extract key points, action items, and summaries
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col justify-between gap-4">
                <p className="text-sm">
                  View and edit key insights extracted from your conversation transcript.
                  Identify action items, analyze sentiment, and organize important information.
                </p>
              </CardContent>
              <CardFooter>
                <Link to={`/insights/${selectedFile.id}`} className="w-full">
                  <Button className="w-full">
                    View Insights
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="bg-primary/5 border-primary/20 w-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  Email Draft
                </CardTitle>
                <CardDescription>
                  Generate professional follow-up emails
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col justify-between gap-4">
                <p className="text-sm">
                  Review and edit the generated email draft based on your conversation.
                  Customize the content, send to recipients, and track versions.
                </p>
              </CardContent>
              <CardFooter>
                <Link to={`/email/${selectedFile.id}`} className="w-full">
                  <Button className="w-full">
                    View Email Draft
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}