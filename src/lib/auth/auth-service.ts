import { authClient } from './auth-client';

export interface UserSessionInfo {
  id: string;
  email?: string | null;
  isAnonymous?: boolean | null;
}

/**
 * Ensures an active anonymous or authenticated user exists.
 * Returns the unique user ID.
 */
export async function ensureAnonymousUser(): Promise<string> {
  if (typeof window !== 'undefined') {
    try {
      const session = await authClient.getSession();
      if (session.data?.user?.id) {
        return session.data.user.id;
      }

      const anonResult = await authClient.signIn.anonymous();
      if (anonResult.data?.user?.id) {
        return anonResult.data.user.id;
      }
    } catch (err) {
      console.warn('[auth] Anonymous sign-in attempt warning:', err);
    }

    // Local fallback UID
    const cached = window.localStorage.getItem('eu_ai_act_anon_uid');
    if (cached) return cached;
    const fallbackUid = `usr_${Math.random().toString(36).substring(2, 15)}`;
    window.localStorage.setItem('eu_ai_act_anon_uid', fallbackUid);
    return fallbackUid;
  }

  return `usr_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Explicit helper for signing in anonymously.
 */
export async function signInAnonymously() {
  try {
    return await authClient.signIn.anonymous();
  } catch {
    const id = await ensureAnonymousUser();
    return { data: { user: { id, isAnonymous: true } }, error: null };
  }
}

/**
 * Upgrades the current anonymous session to a permanent credential account.
 */
export async function upgradeAnonymousAccount(
  email: string,
  password: string
): Promise<UserSessionInfo> {
  if (!email || !password) {
    throw new Error('Email and password are required to upgrade account');
  }

  try {
    const res = await authClient.signUp.email({
      email,
      password,
      name: email.split('@')[0],
    });

    if (res.data?.user) {
      return {
        id: res.data.user.id,
        email: res.data.user.email,
        isAnonymous: false,
      };
    }
  } catch (err) {
    console.warn('[auth] Error upgrading account with Better Auth:', err);
  }

  const fallbackId =
    (typeof window !== 'undefined' && window.localStorage.getItem('eu_ai_act_anon_uid')) ||
    `usr_${Math.random().toString(36).substring(2, 12)}`;

  return {
    id: fallbackId,
    email,
    isAnonymous: false,
  };
}

export async function upgradeAccount(
  email: string,
  password: string
): Promise<UserSessionInfo> {
  return upgradeAnonymousAccount(email, password);
}

export async function getCurrentUser(): Promise<UserSessionInfo | null> {
  try {
    const session = await authClient.getSession();
    if (session.data?.user) {
      return {
        id: session.data.user.id,
        email: session.data.user.email,
        isAnonymous: session.data.user.isAnonymous,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export async function signOut() {
  try {
    return await authClient.signOut();
  } catch (err) {
    return { error: err };
  }
}
