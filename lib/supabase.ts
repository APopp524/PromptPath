import { createClient } from '@supabase/supabase-js';
import { SessionLog } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export const signInWithGitHub = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'github',
  });
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

