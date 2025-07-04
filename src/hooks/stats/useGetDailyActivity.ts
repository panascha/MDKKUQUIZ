import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { BackendRoutes } from '../../config/apiRoutes';

export interface DailyActivityData {
  quiz: { created: number; updated: number };
  keyword: { created: number; updated: number };
  report: { created: number; updated: number };
}

export const useGetDailyActivity = (date: string, enabled: boolean = true) => {
  const { data: session } = useSession();

  return useQuery<DailyActivityData, Error>({
    queryKey: ['daily-activity', date],
    queryFn: async () => {
      if (!session) throw new Error('No session');
      const res = await axios.post(
        BackendRoutes.DAILY_ACTIVITY,
        { date },
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        }
      );
      if (res.data && res.data.success) {
        return res.data.data;
      }
      throw new Error(res.data?.message || 'Failed to fetch daily activity');
    },
    enabled: !!date && enabled && !!session,
  });
};
