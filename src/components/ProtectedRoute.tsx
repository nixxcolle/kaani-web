import { useText } from "@/lib/translate";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, UserCheck, ArrowRight, ArrowLeft } from "@/components/icons";
import { createGuestSession, getCurrentUser } from "@/lib/auth";
import Header from './Header';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const tx = useText();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (mounted) setIsAuthenticated(!!user);
    };

    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => { mounted = false; window.removeEventListener('auth-change', checkAuth); };
  }, []);

  const handleContinueAsGuest = () => {
    createGuestSession("Guest Learner");
    setIsAuthenticated(true);
  };

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <>
      <Header />
      <main className="min-h-[calc(100dvh-76px)] bg-gradient-section flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-elevated border-emerald-100 bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden">
          <div className="h-2 bg-gradient-accent"></div>
          <CardHeader className="text-center pt-8 pb-4">
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-emerald-100/80 flex items-center justify-center shadow-inner">
              <Sparkles className="h-8 w-8 text-kaani-primary" />
            </div>
            <CardTitle className="text-2xl font-bold font-heading text-kaani-dark">{tx("Welcome to KaAni Learning")}</CardTitle>
            <CardDescription className="text-sm mt-2 text-muted-foreground leading-relaxed">{tx("Sign in to save your knowledge recall progress and module reviews, or continue as a guest for instant access!")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-8 px-6">
            <Button 
              className="w-full bg-kaani-primary hover:bg-kaani-dark text-white font-semibold py-6 rounded-xl shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2" 
              size="lg"
              asChild
            >
              <Link to="/auth">{tx("Sign In or Create Account ")}<ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-emerald-200 text-kaani-dark hover:bg-emerald-50 hover:text-kaani-primary font-medium py-6 rounded-xl flex items-center justify-center gap-2 transition-all" 
              size="lg"
              onClick={handleContinueAsGuest}
            >
              <UserCheck className="h-4 w-4 text-emerald-600" />{tx("Play Instantly as Guest")}</Button>

            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground hover:text-foreground text-sm pt-2" 
              size="sm"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />{tx("Return to Homepage")}</Button>
          </CardContent>
        </Card>
      </main>
      </>
    );
  }

  return <>{children}</>;
};
