import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Stat } from '../../types/api/Stat';
import { BackendRoutes } from '../../config/apiRoutes';


export interface StatsOverviewProps {
    stat: Stat;
}

export const useGetStatOverAll = () => {
    const { data: session } = useSession();

    return useQuery({
        queryKey: ['stats'],
        queryFn: async () => {
            if (!session) throw new Error('No session');
            const response = await axios.get(BackendRoutes.STAT, {
                headers: {
                    Authorization: `Bearer ${session.user.token}`,
                },
            });
            return response.data.data;
        },
        enabled: !!session,
    });
};