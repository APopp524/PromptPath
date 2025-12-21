import { supabase, signInWithGitHub, signOut } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import store from '../store';
import { clearPreferences } from '../store/preferencesSlice';
import { clearPersistedState } from '../store/persist';

/**
 * Auth controller - orchestrates authentication logic
 */

export interface AuthState {
  user: User | null;
  loading: boolean;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuthChanges(
  callback: (user: User | null) => void
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}

/**
 * Sign in with GitHub
 */
export async function handleSignInWithGitHub(): Promise<void> {
  await signInWithGitHub();
}

/**
 * Sign out
 */
export async function handleSignOut(): Promise<void> {
  // Clear Redux preferences state
  store.dispatch(clearPreferences());
  
  // Clear persisted state from localStorage
  clearPersistedState();
  
  await signOut();
}

