import { useState, useRef } from 'react';
import { Upload, X, File, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { TranscriptFile, UploadStatus } from '@/lib/types';

interface FileUploaderProps {
  onFileUploaded: (file: TranscriptFile) => void;
}

export function FileUploader({ onFileUploaded }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };
  
  const validateAndSetFile = (file: File) => {
    // Check file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'txt' && fileExt !== 'pdf') {
      toast.error('Only .txt and .pdf files are supported');
      return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }
    
    setFile(file);
  };
  
  const removeFile = () => {
    setFile(null);
    setStatus('idle');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  
  const uploadFile = async () => {
    if (!file) return;
    
    setStatus('uploading');
    
    try {
      const uploadedFile = await api.uploadTranscript(file);
      setStatus('success');
      
      // Save to localStorage for persistence
      api.saveTranscriptFile(uploadedFile);
      
      toast.success('File uploaded successfully');
      onFileUploaded(uploadedFile);
    } catch (error) {
      setStatus('error');
      toast.error('Failed to upload file');
      console.error(error);
    }
  };
  
  return (
    <div className="w-full">
      <div
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-60 border-2 border-dashed rounded-lg transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-border",
          file ? "bg-muted/30" : "bg-background"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id="file-upload"
          type="file"
          className="hidden"
          accept=".txt,.pdf"
          onChange={handleChange}
          disabled={status === 'uploading'}
        />
        
        {!file ? (
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PDF or TXT (MAX. 5MB)
              </p>
            </div>
          </label>
        ) : (
          <div className="flex flex-col items-center p-6 w-full">
            <div className="flex items-center justify-center w-full mb-4">
              <File className="h-8 w-8 text-primary mr-2" />
              <div className="flex-1 truncate">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                disabled={status === 'uploading'}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              className="w-full max-w-xs"
              disabled={status === 'uploading'}
              onClick={uploadFile}
            >
              {status === 'uploading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>Upload</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}