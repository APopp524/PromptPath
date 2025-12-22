import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

/**
 * OAuth Callback Handler
 * 
 * Processes PKCE OAuth redirect and immediately cleans the URL.
 * With detectSessionInUrl: true, Supabase automatically extracts the session from the URL hash.
 */
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase automatically processes the URL hash and establishes the session
      await supabase.auth.getSession();
      
      // Immediately clean URL and redirect to home
      router.replace('/');
    };

    handleCallback();
  }, [router]);

  return null;
}
