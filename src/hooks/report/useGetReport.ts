import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { BackendRoutes } from '@/config/apiRoutes';
import { Report } from '@/types/api/Report';

interface UseGetReportOptions {
    status?: 'pending' | 'approved' | 'rejected';
}

export const useGetReport = (options?: UseGetReportOptions) => {
    const { data: session } = useSession();

    return useQuery({
        queryKey: ['reports', options?.status],
        queryFn: async () => {
            if (!session) throw new Error('No session');
            const response = await axios.get(BackendRoutes.REPORT, {
                headers: {
                    Authorization: `Bearer ${session.user.token}`,
                },
                params: {
                    status: options?.status
                }
            });
            return response.data.data;
        },
        enabled: !!session,
    });
};
