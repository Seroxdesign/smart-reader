import { createClient } from '@supabase/supabase-js';
import { createContext, useContext, useState, useEffect } from 'react';

// Create a context
const SupabaseContext = createContext();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

function SupabaseProvider({ children }) {
  const supabaseNew = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const [token, setToken] = useState(null);
  const [supabase, setSupabase] = useState(supabaseNew);

  useEffect(() => {
    if (!token) {
      return;
    }
    const newSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    newSupabase.realtime.accessToken = token;
    setSupabase(newSupabase);
  }, [token]);

  return (
    <SupabaseContext.Provider value={{ supabase, setToken }}>
      {children}
    </SupabaseContext.Provider>
  );
}

function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}

export { SupabaseProvider, useSupabase };
