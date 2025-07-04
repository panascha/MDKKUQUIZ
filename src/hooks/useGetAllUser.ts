import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { BACKEND_URL } from '@/config/apiRoutes';

export const useGetAllUser = (enabled: boolean = true) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      if (!session?.user.token) throw new Error('No session token');
      const res = await axios.get(`${BACKEND_URL}/api/v1/auth/users`, {
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
      });
      if (res.data && res.data.success) {
        return res.data.data;
      }
      throw new Error(res.data?.message || 'Failed to fetch users');
    },
    enabled: enabled && !!session?.user.token,
  });
};
