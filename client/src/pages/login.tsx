import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn, UserPlus, Snowflake } from 'lucide-react';

export default function LoginPage() {
  const { user, loading, login, signup } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Snowflake className="h-24 w-24 text-[#1975D2]" />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Already Logged In</CardTitle>
            <CardDescription>
              You're logged in as {user.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-primary/5 to-primary/10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Snowflake className="h-24 w-24 text-[#1975D2]" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to Freezer Genie
          </CardTitle>
          <CardDescription className="text-center">
            Manage your freezer inventory with ease
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={login}
            className="w-full"
            size="lg"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Log In
          </Button>
          <Button
            onClick={signup}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Sign Up
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Sign up with your email or use a social provider (Google, GitHub, etc.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

