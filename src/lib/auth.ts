import type { User as AuthUser } from '@supabase/supabase-js';
import { supabase, authRedirectUrl } from './supabase';
import { authErrorMessage, authRetryDelay, authRetryScope } from './auth-errors';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  is_guest?: boolean;
}
export interface LoginData { email: string; password: string }
export interface SignupData extends LoginData { name: string }
type AuthResult = { success: boolean; user?: User; error?: string; confirmationRequired?: boolean; retryAfterSeconds?: number; retryScope?: 'email' | 'all' };

const failedAuth = (error: unknown, fallback: string): AuthResult => ({
  success: false,
  error: authErrorMessage(error, fallback),
  retryAfterSeconds: authRetryDelay(error),
  retryScope: authRetryScope(error),
});

function rememberUser(user: User): User {
  try {
    sessionStorage.removeItem('kaani_guest');
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
  } catch { /* Supabase owns the session; optional display caches must not reject a valid login. */ }
  window.dispatchEvent(new Event('auth-change'));
  return user;
}

const profile = (user: AuthUser): User => ({
  id: user.id, email: user.email || '',
  name: user.user_metadata?.name || user.email?.split('@')[0] || 'Learner',
  created_at: user.created_at,
});

export async function signUp(data: SignupData): Promise<AuthResult> {
  if (typeof data.name !== 'string' || !data.name.trim() || data.name.trim().length > 120) return { success: false, error: 'Enter your full name (up to 120 characters).' };
  try {
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email.trim().toLowerCase(), password: data.password,
      options: { data: { name: data.name.trim() }, emailRedirectTo: authRedirectUrl },
    });
    if (error) return failedAuth(error, 'Sign up failed. Please try again.');
    if (!result.user) return { success: false, error: 'Sign up failed. Please try again.' };
    if (!result.session) return { success: true, confirmationRequired: true };
    return { success: true, user: rememberUser(profile(result.user)) };
  } catch (error) {
    return failedAuth(error, 'Unable to connect. Check your connection and try again.');
  }
}

export async function login(data: LoginData): Promise<AuthResult> {
  try {
    const { data: result, error } = await supabase.auth.signInWithPassword({
      email: data.email.trim().toLowerCase(), password: data.password,
    });
    if (error) return { ...failedAuth(error, 'Sign-in failed. Please try again.'), confirmationRequired: error.code === 'email_not_confirmed' };
    if (!result.user || !result.session) return { success: false, error: 'Sign-in failed. Please try again.' };
    return { success: true, user: rememberUser(profile(result.user)) };
  } catch (error) {
    return failedAuth(error, 'Unable to connect. Check your connection and try again.');
  }
}

export async function resendConfirmation(email: string): Promise<AuthResult> {
  if (!email.trim()) return { success: false, error: 'Enter your email address first.' };
  try {
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim().toLowerCase(), options: { emailRedirectTo: authRedirectUrl } });
    return error ? failedAuth(error, 'Confirmation email could not be sent. Please try again.') : { success: true };
  } catch (error) {
    return failedAuth(error, 'Unable to connect. Check your connection and try again.');
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const guest = JSON.parse(sessionStorage.getItem("kaani_guest") || "null");
    if (guest?.is_guest && typeof guest.id === "string" && guest.id.startsWith("guest-")) return guest;
  } catch { /* Ignore invalid guest data. */ }
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) return profile(data.user);
  } catch { /* Guest access remains available offline. */ }
  return null;
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) await supabase.auth.signOut({ scope: 'local' });
  sessionStorage.removeItem('kaani_guest');
  localStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('kaani_local_registered_users');
  window.dispatchEvent(new Event('auth-change'));
}

export function createGuestSession(name = 'Guest Learner'): User {
  const user: User = { id: 'guest-' + crypto.randomUUID(), email: '', name, created_at: new Date().toISOString(), is_guest: true };
  sessionStorage.setItem('kaani_guest', JSON.stringify(user));
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('isAuthenticated', 'true');
  window.dispatchEvent(new Event('auth-change'));
  return user;
}
