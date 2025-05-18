import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Insight, InsightCategory } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Check, 
  MessageSquare, 
  AlertTriangle, 
  HelpCircle, 
  RotateCcw,
  Calendar,
  User,
  Flag
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface InsightCardProps {
  insight: Insight;
  onUpdate: (id: string, updates: Partial<Insight>) => Promise<void>;
  isUpdating?: boolean;
}

export function InsightCard({ insight, onUpdate, isUpdating = false }: InsightCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(insight.content);
  const [editedStatus, setEditedStatus] = useState(insight.status);
  const [editedPriority, setEditedPriority] = useState(insight.priority);
  const [editedDueDate, setEditedDueDate] = useState(insight.dueDate);
  const [editedAssignee, setEditedAssignee] = useState(insight.assignee);
  
  const handleSave = async () => {
    if (editedContent.trim() === '') return;
    
    try {
      await onUpdate(insight.id, {
        content: editedContent,
        status: editedStatus,
        priority: editedPriority,
        dueDate: editedDueDate,
        assignee: editedAssignee,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update insight:', error);
      // Reset to original values on error
      setEditedContent(insight.content);
      setEditedStatus(insight.status);
      setEditedPriority(insight.priority);
      setEditedDueDate(insight.dueDate);
      setEditedAssignee(insight.assignee);
    }
  };
  
  const handleCancel = () => {
    setEditedContent(insight.content);
    setEditedStatus(insight.status);
    setEditedPriority(insight.priority);
    setEditedDueDate(insight.dueDate);
    setEditedAssignee(insight.assignee);
    setIsEditing(false);
  };
  
  const getCategoryIcon = () => {
    switch (insight.category) {
      case 'sentiment':
        return <MessageSquare className="h-4 w-4" />;
      case 'action':
        return <AlertTriangle className="h-4 w-4" />;
      case 'question':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  const getCategoryClass = () => {
    switch (insight.category) {
      case 'sentiment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'action':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'question':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityClass = () => {
    switch (insight.priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return '';
    }
  };
  
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("inline-flex items-center px-2 py-1 text-xs font-medium rounded", getCategoryClass())}>
              {getCategoryIcon()}
              <span className="ml-1 capitalize">{insight.category}</span>
            </span>
            <span className={cn("inline-flex items-center px-2 py-1 text-xs font-medium rounded", getPriorityClass())}>
              <Flag className="h-3 w-3 mr-1" />
              {insight.priority}
            </span>
          </div>
          
          {!isEditing ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditing(true)}
              disabled={isUpdating}
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCancel}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleSave}
                disabled={isUpdating}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[80px]"
              disabled={isUpdating}
            />
            
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={editedStatus}
                onValueChange={setEditedStatus}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={editedPriority}
                onValueChange={setEditedPriority}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !editedDueDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {editedDueDate ? format(new Date(editedDueDate), 'PPP') : <span>Due Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={editedDueDate ? new Date(editedDueDate) : undefined}
                    onSelect={(date) => setEditedDueDate(date?.toISOString())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Select
                value={editedAssignee}
                onValueChange={setEditedAssignee}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alex">Alex</SelectItem>
                  <SelectItem value="sarah">Sarah</SelectItem>
                  <SelectItem value="mike">Mike</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm">{insight.content}</p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {insight.assignee || 'Unassigned'}
              </span>
              
              {insight.dueDate && (
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(insight.dueDate), 'MMM d')}
                </span>
              )}
              
              <span className="capitalize">{insight.status}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function InsightCardSkeleton() {
  return (
    <Card className="transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-[80px] w-full" />
      </CardContent>
    </Card>
  );
}