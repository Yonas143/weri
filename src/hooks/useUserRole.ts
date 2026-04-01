import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';

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
        // Use maybeSingle to avoid error when row doesn't exist
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user role:', error.message, error.code);
          // If table doesn't exist or RLS blocks, check user metadata as fallback
          const metaRole = user.user_metadata?.role;
          setRole(metaRole === 'admin' ? 'admin' : 'user');
        } else {
          setRole((data?.role as UserRole) || 'user');
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
    isUser: role === 'user'
  };
}
