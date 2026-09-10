import { createClient } from '@/lib/supabase/client';
import type { User, AuthResponse, AuthError } from '@supabase/supabase-js';

/**
 * Ensures an active user session exists, generating an anonymous user session if needed.
 * Returns the unique user ID (auth.uid).
 */
export async function ensureAnonymousUser(): Promise<string> {
  const supabase = createClient();

  // Check if an existing session is present
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.warn('[auth] Error retrieving existing session:', sessionError.message);
  }

  if (sessionData.session?.user?.id) {
    return sessionData.session.user.id;
  }

  // Also check getUser in case session cache is stale
  const { data: userData } = await supabase.auth.getUser();
  if (userData.user?.id) {
    return userData.user.id;
  }

  // Provision new anonymous session
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    const errorMsg = error?.message || 'Failed to create anonymous Supabase session';
    console.error('[auth] Anonymous sign-in error:', errorMsg);
    throw new Error(errorMsg);
  }

  return data.user.id;
}

/**
 * Explicit wrapper for supabase.auth.signInAnonymously().
 */
export async function signInAnonymously(): Promise<AuthResponse> {
  const supabase = createClient();
  return await supabase.auth.signInAnonymously();
}

/**
 * Upgrades the current anonymous user account to a permanent registered account
 * by associating an email and password via supabase.auth.updateUser.
 * This preserves the existing auth.uid() and all associated compliance reports.
 */
export async function upgradeAnonymousAccount(
  email: string,
  password: string
): Promise<User> {
  if (!email || !password) {
    throw new Error('Email and password are required to upgrade account');
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.updateUser({
    email,
    password,
  });

  if (error || !data.user) {
    const errorMsg = error?.message || 'Failed to upgrade anonymous account';
    console.error('[auth] Account upgrade error:', errorMsg);
    throw new Error(errorMsg);
  }

  return data.user;
}

/**
 * Alias wrapper for upgradeAnonymousAccount.
 */
export async function upgradeAccount(
  email: string,
  password: string
): Promise<User> {
  return upgradeAnonymousAccount(email, password);
}

/**
 * Retrieves the currently authenticated user (anonymous or permanent), if any.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return data.user;
}

/**
 * Signs out the current user session.
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const supabase = createClient();
  return await supabase.auth.signOut();
}
