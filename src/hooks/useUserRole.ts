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
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('user'); // Default to user if error
        } else {
          setRole(data?.role as UserRole || 'user');
        }
      } catch (err) {
        console.error('Failed to fetch role:', err);
        setRole('user');
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [user]);

  return {
    role,
    loading,
    isAdmin: role === 'admin',
    isUser: role === 'user'
  };
}
