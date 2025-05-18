import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/app-layout';
// import { EmailEditor } from '@/components/email-editor';
import { EmailDraft } from '@/lib/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Loader2, Send, RefreshCw, Save } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export function EmailPage() {
  const { fileId } = useParams<{ fileId: string }>();
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);
  const [emailContent, setEmailContent] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [allVersions, setAllVersions] = useState<EmailDraft[]>([]);
  const [selectedVersion, setSelectedVersion] = useState('latest');
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [toEmail, setToEmail] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!fileId) return;
    
    const fetchEmailDraft = async () => {
      setIsLoading(true);
      try {
        const draft = await api.getEmailDraft(fileId);
        setEmailDraft(draft);
        setEmailContent(draft.content);
        
        // Load version history from localStorage
        const storedVersions = localStorage.getItem(`emailVersions-${fileId}`);
        if (storedVersions) {
          const versions = JSON.parse(storedVersions);
          setAllVersions([...versions, draft]);
        } else {
          setAllVersions([draft]);
        }
      } catch (error) {
        toast.error('Failed to load email draft');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmailDraft();
  }, [fileId]);
  
  const handleSaveFeedback = async () => {
    if (!fileId || !feedback.trim()) return;
    
    setIsSaving(true);
    try {
      const updatedDraft = await api.updateEmailDraft(fileId, feedback);
      
      // Save current draft to version history
      if (emailDraft) {
        const updatedVersions = [...allVersions];
        // Only add new version if it's different from the last one
        if (updatedVersions[updatedVersions.length - 1]?.id !== updatedDraft.id) {
          updatedVersions.push(updatedDraft);
          setAllVersions(updatedVersions);
          // Save versions to localStorage
          localStorage.setItem(`emailVersions-${fileId}`, JSON.stringify(updatedVersions));
        }
      }
      
      setEmailDraft(updatedDraft);
      setEmailContent(updatedDraft.content);
      setFeedback('');
      toast.success('Email draft updated successfully');
    } catch (error) {
      toast.error('Failed to update email draft');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleLoadVersion = (version: number) => {
    const selectedDraft = allVersions[version];
    if (selectedDraft) {
      setEmailContent(selectedDraft.content);
    }
  };
  
  const handleRefreshDraft = async () => {
    if (!fileId) return;
    
    setIsRefreshing(true);
    try {
      const draft = await api.getEmailDraft(fileId);
      setEmailDraft(draft);
      setEmailContent(draft.content);
      toast.success('Email draft refreshed');
    } catch (error) {
      toast.error('Failed to refresh email draft');
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleSendEmail = async () => {
    if (!toEmail.trim() || !fromEmail.trim() || !emailDraft) {
      toast.error('Please provide valid email addresses');
      return;
    }
    
    setIsSending(true);
    try {
      await api.sendEmail({
        to: toEmail,
        from: fromEmail, // This is mapped to from_email in the API call
        subject: emailDraft.subject,
        content: emailContent
      });
      setShowSendDialog(false);
      toast.success('Email sent successfully');
    } catch (error) {
      toast.error('Failed to send email');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };
  
  if (isLoading) {
    return (
      <AppLayout centered={true}>
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="w-full space-y-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Email Draft</h1>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefreshDraft}
              disabled={isRefreshing}
              size="sm"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            
            <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Email</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label htmlFor="from-email" className="text-right">From:</Label>
                    <Input
                      id="from-email"
                      className="col-span-3"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      placeholder="your-email@example.com"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label htmlFor="to-email" className="text-right">To:</Label>
                    <Input
                      id="to-email"
                      className="col-span-3"
                      value={toEmail}
                      onChange={(e) => setToEmail(e.target.value)}
                      placeholder="recipient@example.com"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label htmlFor="subject" className="text-right">Subject:</Label>
                    <Input
                      id="subject"
                      className="col-span-3"
                      value={emailDraft?.subject || ''}
                      disabled
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSendDialog(false)}>Cancel</Button>
                  <Button onClick={handleSendEmail} disabled={isSending}>
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs 
              defaultValue="latest" 
              value={selectedVersion} 
              onValueChange={setSelectedVersion}
              className="w-full"
            >
              <div className="flex items-center mb-4 border-b">
                <TabsList className="w-full">
                  <TabsTrigger value="latest">Latest</TabsTrigger>
                  {allVersions.length > 1 && allVersions.map((version, index) => (
                    <TabsTrigger 
                      key={index} 
                      value={`v${index + 1}`}
                      onClick={() => handleLoadVersion(index)}
                    >
                      v{index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              <Card className="w-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      {selectedVersion === 'latest' ? 'Latest Draft' : `Version ${selectedVersion.substring(1)}`}
                      {emailDraft && (
                        <Badge variant="outline" className="ml-2">
                          {new Date(emailDraft.updatedAt).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                    {emailDraft?.subject && (
                      <span className="text-sm font-normal text-muted-foreground">
                        Subject: {emailDraft.subject}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    className="font-mono min-h-[400px] text-sm w-full"
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    placeholder="Email content will appear here"
                    readOnly
                  />
                </CardContent>
              </Card>
            </Tabs>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="w-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2 text-primary" />
                  Suggest Improvements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[320px] w-full"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide suggestions to improve this email draft..."
                />
              </CardContent>
              <CardFooter className="justify-end">
                <Button 
                  onClick={handleSaveFeedback} 
                  disabled={!feedback.trim() || isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Apply Suggestions
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}