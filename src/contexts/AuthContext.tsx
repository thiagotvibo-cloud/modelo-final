import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ session: null, user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason && 
        event.reason.message && 
        event.reason.message.includes('Refresh Token')
      ) {
        event.preventDefault();
        supabase?.auth.signOut().finally(() => {
          setSession(null);
          setUser(null);
          setLoading(false);
        });
      }
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    if (!supabase) {
      setLoading(false);
      return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        if (error.message.includes("Refresh Token")) {
          // Force sign out to clear bad session
          supabase?.auth.signOut();
        } else {
          console.error("Supabase auth error:", error.message);
        }
      }
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    }).catch((err) => {
      if (err.message && err.message.includes("Refresh Token")) {
        supabase?.auth.signOut();
      } else {
        console.error(err);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
