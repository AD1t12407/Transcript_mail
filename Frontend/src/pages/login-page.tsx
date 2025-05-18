import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from 'sonner';
import { Loader2, Lock, Mail, MessageSquare, Mail as MailIcon } from 'lucide-react';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password');
      return;
    }
    
    try {
      await login(username, password);
      toast.success('Login successful');
      navigate('/');
    } catch (error) {
      toast.error('Invalid username or password');
    }
  };
  
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Left side - Login form */}
      <div className="flex items-center justify-center px-4 py-12 md:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <div className="size-10 rounded-md bg-primary flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">ConvoInsight</h1>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>
                Access your transcripts and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      className="pl-10"
                      placeholder="user@example.com"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-sm text-primary hover:underline underline-offset-4">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="relative w-full mt-2">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Demo Credentials
                  </span>
                </div>
              </div>
              
              <div className="mt-4 grid gap-2 text-center text-sm">
                <p>Username: <code className="relative rounded bg-muted px-2 py-1 font-mono text-xs">demo</code></p>
                <p>Password: <code className="relative rounded bg-muted px-2 py-1 font-mono text-xs">password</code></p>
              </div>
            </CardFooter>
          </Card>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Don't have an account?{" "}
              <a href="#" className="text-primary font-medium hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Feature highlights */}
      <div className="hidden lg:block bg-primary/10 border-l">
        <div className="flex h-full items-center justify-center px-8 lg:px-12">
          <div className="max-w-lg space-y-8 w-full">
            <div className="flex flex-col space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">Transform your conversations</h2>
              <p className="text-muted-foreground text-xl">
                Extract key insights and generate professional emails from your conversation transcripts.
              </p>
            </div>
            
            <div className="grid gap-8">
              <div className="flex items-start space-x-5">
                <div className="bg-primary/20 p-3 rounded-full">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">AI-Powered Insights</h3>
                  <p className="text-muted-foreground mt-2">
                    Automatically extract key points, action items, and summaries from your conversations.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-5">
                <div className="bg-primary/20 p-3 rounded-full">
                  <MailIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">Professional Email Drafts</h3>
                  <p className="text-muted-foreground mt-2">
                    Generate well-structured, professional follow-up emails based on your transcripts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Theme toggle in top-right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}