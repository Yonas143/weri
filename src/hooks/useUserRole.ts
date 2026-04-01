import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { API_URL } from '../config';

export type UserRole = 'admin' | 'user' | null;

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // Get the session token to send to backend
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          setRole('user');
          setLoading(false);
          return;
        }

        // Use backend endpoint which uses service role key (bypasses RLS)
        const res = await fetch(`${API_URL}/api/user/role`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
          const data = await res.json();
          setRole(data.role as UserRole || 'user');
        } else {
          setRole('user');
        }
      } catch (err) {
        console.error('Failed to fetch role:', err);
        setRole('user');
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [user?.id]);

  return {
    role,
    loading,
    isAdmin: role === 'admin',
    isUser: role === 'user',
  };
}
