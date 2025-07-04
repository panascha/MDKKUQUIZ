import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { BackendRoutes } from '@/config/apiRoutes';
import { UserStat } from '@/types/api/Stat';

export const useGetUserStatById = (userId: string, subjectId: string, enabled: boolean = true) => {
  const { data: session } = useSession();

  return useQuery<UserStat, Error>({
    queryKey: ['user-stat', userId, subjectId],
    queryFn: async () => {
      if (!session) throw new Error('No session');
      if (!userId) throw new Error('No userId');
      if (!subjectId) throw new Error('No subjectId');
      const res = await axios.get(`${BackendRoutes.USER_STATS}/${userId}/${subjectId}`, {
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
      });
      if (res.data && res.data.success) {
        return res.data.data;
      }
      throw new Error(res.data?.message || 'Failed to fetch user stat');
    },
    enabled: enabled && !!session && !!userId && !!subjectId,
  });
};
