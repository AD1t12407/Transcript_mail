import { Insight, EmailDraft, TranscriptFile, InsightCategory } from './types';

// API base URL
const API_BASE_URL = 'http://localhost:8000';

// Helper function for handling API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'API request failed');
  }
  return response.json();
};

export const api = {
  login: async (username: string, password: string) => {
    // Note: This is a mock function since authentication isn't implemented in the backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (username.trim() && password.trim()) {
      return { success: true };
    }
    throw new Error('Invalid credentials');
  },
  
  uploadTranscript: async (file: File): Promise<TranscriptFile> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await handleResponse<{
      text: string;
      filename: string;
      file_type: string;
      saved_path: string;
    }>(response);
    
    // Convert backend response to frontend TranscriptFile format
    return {
      id: data.filename.split('.')[0], // Use filename without extension as ID
      filename: data.filename,
      uploadedAt: new Date().toISOString(),
      status: 'processed',
    };
  },
  
  getRecentTranscripts: async (): Promise<TranscriptFile[]> => {
    // Note: Backend doesn't have an endpoint to list files, this would need to be added
    // For now, we'll use local storage to persist uploaded files between sessions
    const storedFiles = localStorage.getItem('transcriptFiles');
    return storedFiles ? JSON.parse(storedFiles) : [];
  },
  
  getKeyInsights: async (fileId: string): Promise<Insight[]> => {
    const response = await fetch(`${API_BASE_URL}/api/get-key-insights/${fileId}`);
    const data = await handleResponse<{
      insights: Array<{
        category: string;
        content: string[];
      }>;
    }>(response);
    
    // Convert backend response to frontend Insight format with required fields
    return data.insights.map((item, index) => {
      // Map backend categories to frontend InsightCategory
      let category: InsightCategory = 'other';
      if (item.category.toLowerCase().includes('action')) {
        category = 'action';
      } else if (item.category.toLowerCase().includes('sentiment') || 
                item.category.toLowerCase().includes('emotion')) {
        category = 'sentiment';
      } else if (item.category.toLowerCase().includes('question')) {
        category = 'question';
      }
      
      return {
        id: `${fileId}-insight-${index}`,
        category: category,
        content: item.content.join('\n'),
        status: 'todo',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
  },
  
  updateKeyInsight: async (fileId: string, insightId: string, content: string): Promise<Insight> => {
    const response = await fetch(`${API_BASE_URL}/api/update-key-insights/${fileId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ suggested_changes: content }),
    });
    
    const data = await handleResponse<{
      insights: Array<{
        category: string;
        content: string[];
      }>;
    }>(response);
    
    // Find the updated insight by category
    const categoryId = insightId.split('-insight-')[1];
    const updatedItem = data.insights[Number(categoryId)];
    
    // Map backend categories to frontend InsightCategory
    let category: InsightCategory = 'other';
    if (updatedItem.category.toLowerCase().includes('action')) {
      category = 'action';
    } else if (updatedItem.category.toLowerCase().includes('sentiment') || 
              updatedItem.category.toLowerCase().includes('emotion')) {
      category = 'sentiment';
    } else if (updatedItem.category.toLowerCase().includes('question')) {
      category = 'question';
    }
    
    return {
      id: insightId,
      category: category,
      content: updatedItem.content.join('\n'),
      status: 'todo',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  
  getEmailDraft: async (fileId: string): Promise<EmailDraft> => {
    const response = await fetch(`${API_BASE_URL}/api/get-mail-draft/${fileId}`);
    const data = await handleResponse<{
      subject: string;
      greeting: string;
      body: string;
      closing: string;
      signature: string;
    }>(response);
    
    // Convert backend response to frontend EmailDraft format
    return {
      id: `${fileId}-email`,
      subject: data.subject,
      content: `${data.greeting}\n\n${data.body}\n\n${data.closing}\n\n${data.signature}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  
  updateEmailDraft: async (fileId: string, content: string): Promise<EmailDraft> => {
    const response = await fetch(`${API_BASE_URL}/api/update-mail-draft/${fileId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ suggested_changes: content }),
    });
    
    const data = await handleResponse<{
      subject: string;
      greeting: string;
      body: string;
      closing: string;
      signature: string;
    }>(response);
    
    // Get the current draft to increment the version
    let currentVersion = 1;
    try {
      const storedDraft = localStorage.getItem(`emailDraft-${fileId}`);
      if (storedDraft) {
        const parsed = JSON.parse(storedDraft);
        currentVersion = parsed.version + 1;
      }
    } catch (e) {
      console.error('Error reading stored draft', e);
    }
    
    // Convert backend response to frontend EmailDraft format
    const updatedDraft = {
      id: `${fileId}-email`,
      subject: data.subject,
      content: `${data.greeting}\n\n${data.body}\n\n${data.closing}\n\n${data.signature}`,
      version: currentVersion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store in localStorage for persistence
    localStorage.setItem(`emailDraft-${fileId}`, JSON.stringify(updatedDraft));
    
    return updatedDraft;
  },
  
  // Add a method to save transcript files to localStorage after upload
  saveTranscriptFile: (file: TranscriptFile): void => {
    const storedFiles = localStorage.getItem('transcriptFiles');
    let files = storedFiles ? JSON.parse(storedFiles) : [];
    
    // Add new file to the beginning of the array
    files = [file, ...files];
    
    // Store in localStorage
    localStorage.setItem('transcriptFiles', JSON.stringify(files));
  },
  
  // Add email sending capability
  sendEmail: async (emailData: { to: string; from: string; subject: string; content: string }): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailData.to,
        from_email: emailData.from,
        subject: emailData.subject,
        content: emailData.content
      }),
    });
    
    await handleResponse<{ success: boolean }>(response);
    return;
  },
  
  // Add method to update all insights at once
  updateAllInsights: async (fileId: string, suggested_changes: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/update-key-insights/${fileId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ suggested_changes }),
    });
    
    await handleResponse<{ insights: Array<{ category: string; content: string[] }> }>(response);
    return;
  }
};