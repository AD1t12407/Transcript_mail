// Define types for the application
export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export type TranscriptFile = {
  id: string;
  filename: string;
  uploadedAt: string;
  status: 'processed' | 'processing' | 'error';
};

export type InsightCategory = 'action' | 'sentiment' | 'question' | 'other';

export type Insight = {
  id: string;
  content: string;
  category: InsightCategory;
  status: 'todo' | 'in-progress' | 'done';
  assignee?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
};

export type EmailDraft = {
  id: string;
  subject: string;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type Revision = {
  id: string;
  content: string;
  createdAt: string;
};