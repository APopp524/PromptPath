import { createClient } from '@supabase/supabase-js';
import { SessionLog, WeeklyInsights } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Supabase client configured with PKCE OAuth flow for secure authentication.
 * 
 * Configuration ensures:
 * - PKCE flow is always used (prevents access tokens in URL)
 * - Sessions are persisted and auto-refreshed
 * - Session detection from URL is enabled for OAuth callbacks
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function getSessionLogs(userId: string): Promise<SessionLog[]> {
  const { data, error } = await supabase
    .from('session_logs')
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching session logs:', error);
    return [];
  }

  return (data || []) as SessionLog[];
}

export async function createSessionLog(
  userId: string,
  sessionLog: Omit<SessionLog, 'id' | 'createdAt' | 'userId'>
): Promise<SessionLog> {
  const { data, error } = await supabase
    .from('session_logs')
    .insert({
      ...sessionLog,
      userId,
      createdAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating session log:', error);
    throw error;
  }

  return data as SessionLog;
}

/**
 * Get weekly insights for a specific week
 */
export async function getWeeklyInsights(
  userId: string,
  weekStart: string
): Promise<WeeklyInsights | null> {
  const { data, error } = await supabase
    .from('weekly_insights')
    .select('*')
    .eq('userId', userId)
    .eq('weekStart', weekStart)
    .maybeSingle();

  if (error) {
    console.error('Error fetching weekly insights:', error);
    return null;
  }

  return data as WeeklyInsights | null;
}

/**
 * Create or update weekly insights
 * Only updates the summary field, preserves userId and weekStart
 */
export async function upsertWeeklyInsights(
  userId: string,
  weekStart: string,
  aiSummary: string
): Promise<WeeklyInsights> {
  const { data, error } = await supabase
    .from('weekly_insights')
    .upsert(
      {
        userId,
        weekStart,
        summary: aiSummary,
        updatedAt: new Date().toISOString(),
      },
      {
        onConflict: 'userId,weekStart',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error upserting weekly insights:', error);
    throw error;
  }

  return data as WeeklyInsights;
}

/**
 * Sign in with GitHub using PKCE OAuth flow.
 * 
 * Redirects to /auth/callback after successful authentication.
 * The redirectTo URL automatically adapts to the current environment
 * (localhost for dev, production URL for Vercel).
 */
export const signInWithGitHub = async () => {  
  console.log('OAuth redirectTo:', `${window.location.origin}/auth/callback`);

  await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};

export const signOut = async () => {
  await supabase.auth.signOut();
};
