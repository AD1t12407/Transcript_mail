import { User, TranscriptFile, Insight, EmailDraft } from './types';

export const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=6366F1&color=fff',
};

export const mockFiles: TranscriptFile[] = [
  {
    id: '1',
    filename: 'client-meeting-2025-06-01.txt',
    uploadedAt: '2025-06-01T14:30:00Z',
    status: 'processed',
  },
  {
    id: '2',
    filename: 'team-discussion-2025-05-28.pdf',
    uploadedAt: '2025-05-28T10:15:00Z',
    status: 'processed',
  },
];

export const mockInsights: Record<string, Insight[]> = {
  '1': [
    {
      id: '1-1',
      content: 'Client expressed concern over timeline for Q3 deliverables',
      category: 'sentiment',
      createdAt: '2025-06-01T15:00:00Z',
      updatedAt: '2025-06-01T15:00:00Z',
    },
    {
      id: '1-2',
      content: 'Need to schedule follow-up meeting to discuss budget adjustments',
      category: 'action',
      createdAt: '2025-06-01T15:00:00Z',
      updatedAt: '2025-06-01T15:00:00Z',
    },
    {
      id: '1-3',
      content: 'Client asked about integrating with their existing systems',
      category: 'question',
      createdAt: '2025-06-01T15:00:00Z',
      updatedAt: '2025-06-01T15:00:00Z',
    },
    {
      id: '1-4',
      content: 'Positive feedback on the latest UI mockups',
      category: 'sentiment',
      createdAt: '2025-06-01T15:00:00Z',
      updatedAt: '2025-06-01T15:00:00Z',
    },
  ],
  '2': [
    {
      id: '2-1',
      content: 'Team agreed to adopt new sprint planning structure',
      category: 'action',
      createdAt: '2025-05-28T11:00:00Z',
      updatedAt: '2025-05-28T11:00:00Z',
    },
    {
      id: '2-2',
      content: 'Concerns raised about current QA bottlenecks',
      category: 'sentiment',
      createdAt: '2025-05-28T11:00:00Z',
      updatedAt: '2025-05-28T11:00:00Z',
    },
  ],
};

export const mockEmailDrafts: Record<string, EmailDraft> = {
  '1': {
    id: '1',
    subject: 'Follow-up: Client Meeting Discussion Points',
    content: `Dear Client Team,

Thank you for the productive meeting today. I wanted to summarize our key discussion points:

1. We acknowledged your timeline concerns and have adjusted our delivery schedule accordingly.
2. Our team will prepare a revised budget proposal by end of week.
3. We'll arrange a technical discussion regarding system integration options.
4. We're pleased you liked the UI direction and will continue refining based on your feedback.

Please let me know if I've missed anything or if you have any questions.

Best regards,
Alex`,
    version: 1,
    createdAt: '2025-06-01T16:00:00Z',
    updatedAt: '2025-06-01T16:00:00Z',
  },
  '2': {
    id: '2',
    subject: 'Team Discussion Action Items - May 28',
    content: `Hi Team,

Following today's discussion, here are the action items we've agreed on:

1. Implement the new sprint planning structure starting next Monday
2. Jane will lead an investigation into the QA bottlenecks and propose solutions
3. All team members should review the updated documentation by EOD Friday
4. Our next retrospective will focus specifically on process improvements

Let me know if you have any questions.

Regards,
Alex`,
    version: 1,
    createdAt: '2025-05-28T13:00:00Z',
    updatedAt: '2025-05-28T13:00:00Z',
  },
};