import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { UserStat } from '../../types/api/Stat';
import { BackendRoutes } from '../../config/apiRoutes';


export const useGetUserStatById = (userId: string, subjectId?: string, enabled: boolean = true) => {
  const { data: session } = useSession();

  return useQuery<UserStat, Error>({
    queryKey: ['user-stat', userId, subjectId],
    queryFn: async () => {
      if (!session) throw new Error('No session');
      if (!userId) throw new Error('No userId');
      
      const url = subjectId 
        ? `${BackendRoutes.USER_STATS}/${userId}/${subjectId}`
        : `${BackendRoutes.USER_STATS}/${userId}`;
        
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
      });
      if (res.data && res.data.success) {
        return res.data.data;
      }
      throw new Error(res.data?.message || 'Failed to fetch user stat');
    },
    enabled: enabled && !!session && !!userId,
  });
};
