import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowRight,
  Mail,
  Loader2,
  RefreshCw,
  Save,
  PlusCircle,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Download,
  FileSpreadsheet,
  ListTodo
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Insight, InsightCategory } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Helper for category badges
const getCategoryBadgeClass = (category: InsightCategory) => {
  const classes = {
    'action': 'bg-blue-500 hover:bg-blue-600',
    'sentiment': 'bg-amber-500 hover:bg-amber-600',
    'question': 'bg-purple-500 hover:bg-purple-600',
    'other': 'bg-slate-500 hover:bg-slate-600'
  };
  return classes[category] || classes.other;
};

const getCategoryLabel = (category: string): string => {
  // Convert from backend format to readable label
  return category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// Extended interface to include task tracking
interface InsightWithTask extends Insight {
  isTask?: boolean;
  completed?: boolean;
}

export function InsightsPage() {
  const { fileId } = useParams<{ fileId: string }>();
  const [insights, setInsights] = useState<InsightWithTask[]>([]);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [currentInsight, setCurrentInsight] = useState<InsightWithTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showTasks, setShowTasks] = useState(false);
  
  useEffect(() => {
    if (!fileId) return;
    
    const fetchInsights = async () => {
      setIsLoading(true);
      try {
        const data = await api.getKeyInsights(fileId);
        
        // Check for saved task states in localStorage
        const savedTasks = localStorage.getItem(`tasks-${fileId}`);
        let taskStates = {};
        
        if (savedTasks) {
          try {
            taskStates = JSON.parse(savedTasks);
          } catch (e) {
            console.error('Error parsing saved tasks', e);
          }
        }
        
        // Apply saved task states to insights
        const enhancedData = data.map(insight => ({
          ...insight,
          isTask: taskStates[insight.id]?.isTask || false,
          completed: taskStates[insight.id]?.completed || false
        }));
        
        setInsights(enhancedData);
        
        // Set the first category as active by default
        if (data.length > 0) {
          setActiveCategory(data[0].category);
        }
      } catch (error) {
        toast.error('Failed to load insights');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInsights();
  }, [fileId]);
  
  const handleSelectInsight = (insight: InsightWithTask) => {
    setCurrentInsight(insight);
    setFeedbackContent(insight.content);
  };
  
  const handleUpdateInsight = async () => {
    if (!currentInsight || !feedbackContent.trim() || !fileId) return;
    
    setIsSaving(true);
    try {
      const updatedInsight = await api.updateKeyInsight(
        fileId,
        currentInsight.id,
        feedbackContent
      );
      
      // Preserve task status
      const enhanced = {
        ...updatedInsight,
        isTask: currentInsight.isTask,
        completed: currentInsight.completed
      };
      
      // Update the insights list
      setInsights(insights.map((insight) =>
        insight.id === enhanced.id ? enhanced : insight
      ));
      
      toast.success('Insight updated successfully');
      setCurrentInsight(enhanced);
    } catch (error) {
      toast.error('Failed to update insight');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSuggestAllImprovements = async () => {
    if (!fileId || !feedbackContent.trim()) return;
    
    setIsSaving(true);
    try {
      // This would trigger the backend endpoint that updates all insights
      await api.updateAllInsights(fileId, feedbackContent);
      
      // Refresh insights after update
      const updatedInsights = await api.getKeyInsights(fileId);
      
      // Preserve task statuses
      const taskStatuses = insights.reduce((acc, insight) => {
        acc[insight.id] = {
          isTask: insight.isTask || false,
          completed: insight.completed || false
        };
        return acc;
      }, {});
      
      const enhancedData = updatedInsights.map(insight => ({
        ...insight,
        isTask: taskStatuses[insight.id]?.isTask || false,
        completed: taskStatuses[insight.id]?.completed || false
      }));
      
      setInsights(enhancedData);
      setFeedbackContent('');
      
      toast.success('All insights updated successfully');
    } catch (error) {
      toast.error('Failed to update insights');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleRefreshInsights = async () => {
    if (!fileId) return;
    
    setIsRefreshing(true);
    try {
      const data = await api.getKeyInsights(fileId);
      
      // Preserve task statuses
      const taskStatuses = insights.reduce((acc, insight) => {
        acc[insight.id] = {
          isTask: insight.isTask || false,
          completed: insight.completed || false
        };
        return acc;
      }, {});
      
      const enhancedData = data.map(insight => ({
        ...insight,
        isTask: taskStatuses[insight.id]?.isTask || false,
        completed: taskStatuses[insight.id]?.completed || false
      }));
      
      setInsights(enhancedData);
      toast.success('Insights refreshed');
    } catch (error) {
      toast.error('Failed to refresh insights');
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const toggleTaskStatus = (insight: InsightWithTask) => {
    const updatedInsights = insights.map(item => 
      item.id === insight.id 
        ? { ...item, isTask: !item.isTask } 
        : item
    );
    
    setInsights(updatedInsights);
    
    // If the current insight is being modified
    if (currentInsight?.id === insight.id) {
      setCurrentInsight({...currentInsight, isTask: !currentInsight.isTask});
    }
    
    // Save task states to localStorage
    saveTaskStates(updatedInsights);
    
    toast.success(insight.isTask ? 'Removed from tasks' : 'Added to tasks');
  };
  
  const toggleTaskCompletion = (insight: InsightWithTask) => {
    const updatedInsights = insights.map(item => 
      item.id === insight.id 
        ? { ...item, completed: !item.completed } 
        : item
    );
    
    setInsights(updatedInsights);
    
    // If the current insight is being modified
    if (currentInsight?.id === insight.id) {
      setCurrentInsight({...currentInsight, completed: !currentInsight.completed});
    }
    
    // Save task states to localStorage
    saveTaskStates(updatedInsights);
  };
  
  const saveTaskStates = (insightsToSave: InsightWithTask[]) => {
    if (!fileId) return;
    
    // Create a map of task states
    const taskStates = insightsToSave.reduce((acc, insight) => {
      acc[insight.id] = {
        isTask: insight.isTask || false,
        completed: insight.completed || false
      };
      return acc;
    }, {});
    
    // Save to localStorage
    localStorage.setItem(`tasks-${fileId}`, JSON.stringify(taskStates));
  };
  
  const exportToExcel = () => {
    if (!fileId) return;
    
    // Filter only tasks
    const tasks = insights.filter(insight => insight.isTask);
    
    if (tasks.length === 0) {
      toast.error('No tasks to export');
      return;
    }
    
    // Prepare CSV content
    let csvContent = "Task,Status,Category,Content\n";
    tasks.forEach((task, index) => {
      // Clean up content for CSV
      const cleanContent = task.content.replace(/"/g, '""').replace(/\n/g, ' ');
      csvContent += `${index + 1},${task.completed ? 'Completed' : 'Pending'},${getCategoryLabel(task.category)},"${cleanContent}"\n`;
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks-${fileId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Tasks exported successfully');
  };
  
  const categorizedInsights = insights.reduce<Record<string, InsightWithTask[]>>((acc, insight) => {
    const category = insight.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(insight);
    return acc;
  }, {});
  
  // Filter tasks if needed
  const taskInsights = insights.filter(insight => insight.isTask);
  
  const categories = Object.keys(categorizedInsights);
  
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
          <h1 className="text-3xl font-bold tracking-tight">Conversation Insights</h1>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={showTasks ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowTasks(!showTasks)}
            >
              <ListTodo className="h-4 w-4 mr-2" />
              {showTasks ? "View All Insights" : "View Tasks"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRefreshInsights}
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportToExcel}
              disabled={taskInsights.length === 0}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Tasks
            </Button>
            <Button asChild size="sm">
              <Link to={`/email/${fileId}`}>
                <Mail className="h-4 w-4 mr-2" />
                View Email
              </Link>
            </Button>
          </div>
        </div>
        
        {insights.length === 0 ? (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-muted-foreground mb-4">
                No insights found for this transcript.
              </p>
              <Button onClick={handleRefreshInsights}>
                Generate Insights
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            <div className="lg:col-span-4">
              <Card className="w-full">
                <CardHeader className="pb-3">
                  <CardTitle>{showTasks ? "Tasks" : "Categories"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {showTasks ? (
                    // Tasks View
                    <ScrollArea className="h-[450px] pr-4">
                      <div className="space-y-2">
                        {taskInsights.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            No tasks yet. Mark insights as tasks to see them here.
                          </p>
                        ) : (
                          taskInsights.map((task) => (
                            <div 
                              key={task.id}
                              className={cn(
                                "flex items-start gap-2 p-3 border rounded-md hover:bg-muted/50 transition-colors",
                                currentInsight?.id === task.id && "bg-muted",
                                task.completed && "opacity-70"
                              )}
                            >
                              <Checkbox 
                                checked={task.completed} 
                                onCheckedChange={() => toggleTaskCompletion(task)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge className={getCategoryBadgeClass(task.category as InsightCategory)}>
                                    {getCategoryLabel(task.category)}
                                  </Badge>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0" 
                                    onClick={() => toggleTaskStatus(task)}
                                  >
                                    <MinusCircle className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                                <p className={cn(
                                  "text-sm line-clamp-2",
                                  task.completed && "line-through"
                                )}>
                                  {task.content}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2 h-7 px-2 text-xs"
                                  onClick={() => handleSelectInsight(task)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  ) : (
                    // Categories View
                    <Tabs defaultValue={categories[0]} value={activeCategory || categories[0]} onValueChange={setActiveCategory}>
                      <TabsList className="mb-4 w-full grid grid-cols-2 md:grid-cols-4">
                        {categories.map(category => (
                          <TabsTrigger key={category} value={category} className="whitespace-nowrap">
                            {getCategoryLabel(category)}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {categories.map(category => (
                        <TabsContent key={category} value={category} className="m-0">
                          <ScrollArea className="h-[450px] pr-4">
                            <Accordion type="single" collapsible className="w-full">
                              {categorizedInsights[category].map((insight, i) => (
                                <AccordionItem key={insight.id} value={insight.id}>
                                  <AccordionTrigger className={cn(
                                    "py-3 hover:bg-muted/50 px-2 rounded-md transition-colors",
                                    currentInsight?.id === insight.id && "bg-muted"
                                  )}>
                                    <div className="flex items-center justify-between w-full pr-4">
                                      <div className="flex flex-col items-start text-left">
                                        <div className="flex items-center">
                                          <span className="text-sm font-medium">
                                            Item {i + 1}
                                          </span>
                                          {insight.isTask && (
                                            <Badge variant="outline" className="ml-2 text-xs">
                                              Task
                                            </Badge>
                                          )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                          {insight.content.split('\n')[0]?.substring(0, 40)}...
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation(); 
                                            toggleTaskStatus(insight);
                                          }}
                                        >
                                          {insight.isTask ? (
                                            <MinusCircle className="h-4 w-4 text-destructive" />
                                          ) : (
                                            <PlusCircle className="h-4 w-4 text-primary" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="pb-2 px-2">
                                    <div className="text-sm">
                                      {insight.content.split('\n').map((line, i) => (
                                        <p key={i} className="mb-1">{line}</p>
                                      ))}
                                      <div className="flex items-center gap-2 mt-2">
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => handleSelectInsight(insight)}
                                        >
                                          Edit
                                        </Button>
                                        {insight.isTask && (
                                          <div className="flex items-center gap-2 ml-2">
                                            <Checkbox
                                              id={`task-${insight.id}`}
                                              checked={insight.completed}
                                              onCheckedChange={() => toggleTaskCompletion(insight)}
                                            />
                                            <label 
                                              htmlFor={`task-${insight.id}`}
                                              className="text-sm cursor-pointer"
                                            >
                                              Mark complete
                                            </label>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </ScrollArea>
                        </TabsContent>
                      ))}
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-8">
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    {currentInsight ? (
                      <div className="flex items-center space-x-2">
                        <span>Edit Insight</span>
                        <Badge className={getCategoryBadgeClass(currentInsight.category as InsightCategory)}>
                          {getCategoryLabel(currentInsight.category)}
                        </Badge>
                        {currentInsight.isTask && (
                          <Badge variant="outline" className="ml-1">
                            Task {currentInsight.completed ? '(Completed)' : ''}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      "Suggest Global Improvements"
                    )}
                  </CardTitle>
                  {currentInsight && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant={currentInsight.isTask ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => toggleTaskStatus(currentInsight)}
                      >
                        {currentInsight.isTask ? (
                          <>
                            <MinusCircle className="h-4 w-4 mr-2" />
                            Remove Task
                          </>
                        ) : (
                          <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add as Task
                          </>
                        )}
                      </Button>
                      {currentInsight.isTask && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTaskCompletion(currentInsight)}
                        >
                          {currentInsight.completed ? 'Mark Incomplete' : 'Mark Complete'}
                        </Button>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Textarea
                    className="min-h-[400px] w-full"
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    placeholder={currentInsight 
                      ? "Edit this insight..." 
                      : "Provide suggestions to improve all insights..."
                    }
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  {currentInsight ? (
                    <>
                      <Button variant="outline" onClick={() => setCurrentInsight(null)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleUpdateInsight} 
                        disabled={!feedbackContent.trim() || isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <div className="w-full flex justify-end">
                      <Button 
                        onClick={handleSuggestAllImprovements}
                        disabled={!feedbackContent.trim() || isSaving}
                        className="ml-auto"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Apply to All Insights
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}