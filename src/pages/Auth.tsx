import { useText } from "@/lib/translate";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Sparkles, UserCheck, CheckCircle2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { signUp, login, createGuestSession, resendConfirmation } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { authErrorMessage } from "@/lib/auth-errors";

const Auth = () => {
  const tx = useText();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const requestPending = useRef(false);
  const [retryAt, setRetryAt] = useState(0);
  const [retryScope, setRetryScope] = useState<'email' | 'all'>('all');
  const [clock, setClock] = useState(Date.now);
  const retrySeconds = Math.max(0, Math.ceil((retryAt - clock) / 1000));
  const submissionPaused = retrySeconds > 0 && (retryScope === 'all' || !isLogin);

  useEffect(() => {
    if (!retryAt) return;
    const timer = setInterval(() => {
      setClock(Date.now());
      if (Date.now() >= retryAt) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [retryAt]);

  const pauseRetries = (seconds?: number, scope: 'email' | 'all' = 'all') => {
    if (!seconds) return;
    const now = Date.now();
    setClock(now);
    setRetryAt(now + seconds * 1000);
    setRetryScope(scope);
  };

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setIsLogin(searchParams.get('mode') !== 'signup');
  }, [searchParams]);

  useEffect(() => {
    const callback = new URLSearchParams(window.location.hash.slice(1));
    if (callback.has('error_code')) {
      setError(authErrorMessage({ code: callback.get('error_code') }, 'The confirmation link could not be verified. Please request another email.'));
      setCanResend(true);
    }
    let redirect: ReturnType<typeof setTimeout>;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        redirect = setTimeout(() => {
          try { sessionStorage.removeItem('kaani_guest'); } catch { /* Optional guest cache. */ }
          window.dispatchEvent(new Event('auth-change'));
          navigate('/quiz', { replace: true });
        }, 0);
      }
    });
    return () => { clearTimeout(redirect); subscription.unsubscribe(); };
  }, [navigate]);

  const handleResend = async () => {
    if (requestPending.current || Date.now() < retryAt) return;
    requestPending.current = true;
    setError(null);
    setNotice(null);
    setIsResending(true);
    try {
      const result = await resendConfirmation(formData.email);
      pauseRetries(result.retryAfterSeconds, result.retryScope);
      if (result.success) setNotice('If your account needs confirmation, a new email has been requested. Check your inbox and spam folder.');
      else setError(result.error || 'Confirmation email could not be sent. Please try again.');
    } finally { requestPending.current = false; setIsResending(false); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requestPending.current || (Date.now() < retryAt && (retryScope === 'all' || !isLogin))) return;
    requestPending.current = true;
    setError(null);
    setNotice(null);
    setCanResend(false);
    setIsLoading(true);

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match!');
        setIsLoading(false);
        return;
      }

      if (!isLogin && formData.password.length < 6) {
        setError('Password must be at least 6 characters long!');
        setIsLoading(false);
        return;
      }

      const result = isLogin
        ? await login({ email: formData.email, password: formData.password })
        : await signUp({ email: formData.email, password: formData.password, name: formData.name });
      pauseRetries(result.retryAfterSeconds, result.retryScope);
      if (result.confirmationRequired) {
        setCanResend(true);
        setIsLogin(true);
        setSearchParams({ mode: 'login' }, { replace: true });
        if (result.success) {
          setNotice('Check your email to confirm your account, then sign in. Check your spam folder if the email is missing.');
          setFormData(previous => ({ ...previous, password: '', confirmPassword: '' }));
        } else setError(result.error || 'Confirm your email before signing in. You can request another confirmation email below.');
      } else if (result.success && result.user) navigate('/quiz', { replace: true });
      else setError(result.error || 'Sign-in failed. Please try again.');
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      requestPending.current = false;
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    createGuestSession("KaAni Scholar");
    navigate("/quiz");
  };

  return (
    <div className="min-h-screen bg-gradient-section">
      <Header />

      <main className="container px-4 py-8 md:py-14">
        <div className="max-w-lg mx-auto space-y-6">
          
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-muted-foreground hover:text-kaani-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{tx("Return to Homepage")}</span>
          </Link>

          <Card className="rounded-3xl shadow-elevated border border-emerald-100 bg-white overflow-hidden">
            <div className="h-2 bg-gradient-accent"></div>
            
            <CardHeader className="text-center pt-8 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-kaani-primary mx-auto flex items-center justify-center mb-3 shadow-inner">
                <User className="h-7 w-7" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-kaani-dark">
                {tx(isLogin ? "Welcome Back!" : "Create Free Account")}
              </h1>
              <CardDescription className="text-xs md:text-sm text-muted-foreground">{tx("Join the Philippine agriculture and fisheries learning platform")}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 p-6 md:p-8 pt-0">
              
              {/* Tab Selector */}
              <Tabs 
                value={isLogin ? 'login' : 'signup'} 
                onValueChange={(val) => {
                  setIsLogin(val === 'login');
                  setSearchParams({ mode: val }, { replace: true });
                  setError(null);
                  setNotice(null);
                  setCanResend(false);
                }} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1 bg-slate-100">
                  <TabsTrigger value="login" className="rounded-xl text-xs md:text-sm font-bold">{tx("Sign In")}</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-xl text-xs md:text-sm font-bold">{tx("Create Account")}</TabsTrigger>
                </TabsList>
              </Tabs>

              {error && (
                <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs md:text-sm text-rose-700 animate-in fade-in duration-200">
                  {tx(error)}
                </div>
              )}

              {notice && <div role="status" className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">{tx(notice)}</div>}
              {canResend && <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{tx('Use the email address you registered with to request a new confirmation link.')}</p>
                <Button type="button" variant="outline" disabled={isResending || isLoading || retrySeconds > 0} onClick={handleResend} className="w-full rounded-xl">
                  {tx(isResending ? 'Sending...' : 'Resend confirmation email')}
                </Button>
              </div>}
              {retrySeconds > 0 && <p role="status" className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-3">
                {tx(retryScope === 'email' ? 'Email requests are paused. Password sign-in remains available for confirmed accounts.' : 'Please pause before trying again.')} {tx('Retry available in')} {retrySeconds} {tx('seconds.')}
              </p>}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-bold text-slate-700">{tx("Full Name")}</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        autoComplete="name"
                        maxLength={120}
                        placeholder={tx("e.g. Maria Santos")}
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10 rounded-xl border-slate-200"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-700">{tx("Email Address")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder={tx("youremail@example.com")}
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 rounded-xl border-slate-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-bold text-slate-700">{tx("Password")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={tx("••••••••")}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 rounded-xl border-slate-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={tx(showPassword ? "Hide password" : "Show password")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700">{tx("Confirm Password")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder={tx("••••••••")}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 rounded-xl border-slate-200"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isLoading || isResending || submissionPaused}
                  className="w-full bg-kaani-primary hover:bg-kaani-dark text-white font-bold py-6 rounded-xl shadow-md text-base mt-2"
                >
                  {tx(isLoading ? "Processing..." : isLogin ? "Sign In" : "Register Account")}
                </Button>
              </form>

              {/* 1-Click Guest Access Option */}
              <div className="pt-2">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-xs font-semibold text-muted-foreground uppercase">{tx("Or Quick Access")}</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleQuickDemo}
                  className="w-full mt-2 border-emerald-200 text-kaani-dark hover:bg-emerald-50 rounded-xl py-5 font-bold text-xs md:text-sm flex items-center justify-center gap-2"
                >
                  <UserCheck className="h-4 w-4 text-kaani-primary" />
                  <span>{tx("Continue Instantly as Guest")}</span>
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
