import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { BackendRoutes } from '@/config/apiRoutes';
import { UserStat } from '@/types/api/Stat';



export const useGetUserStats = (enabled: boolean = true) => {
  const { data: session } = useSession();

  return useQuery<UserStat[], Error>({
    queryKey: ['user-stats'],
    queryFn: async () => {
      if (!session) throw new Error('No session');
      const res = await axios.get(BackendRoutes.USER_STATS, {
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
      });
      if (res.data && res.data.success) {
        return res.data.data;
      }
      throw new Error(res.data?.message || 'Failed to fetch user stats');
    },
    enabled: enabled && !!session,
  });
};
