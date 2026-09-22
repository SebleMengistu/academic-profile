import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getMe } from '../services/admin';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, setLoading } = useAuthStore();

  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    retry: false,
    staleTime: Infinity,
    enabled: !user, // only fetch if we don't have a user cached
  });

  useEffect(() => {
    if (queryLoading) {
      setLoading(true);
    } else {
      if (data?.user) {
        setUser(data.user);
      } else if (!user) {
        setLoading(false);
      }
    }
  }, [data, queryLoading]);

  return { user, isAuthenticated, isLoading: isLoading || queryLoading };
};
