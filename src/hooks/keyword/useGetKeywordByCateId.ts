import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { BackendRoutes } from '@/config/apiRoutes';

interface UseGetKeywordOptions {
    status?: 'pending' | 'approved' | 'rejected' | 'reported';
}

export const useGetKeywordByCateId = (CateId: string) => {
    const { data: session } = useSession();

    return useQuery({
        queryKey: ['keywords'],
        queryFn: async () => {
            if (!session) throw new Error('No session');
            const response = await axios.get(`${BackendRoutes.KEYWORD}/cate/${CateId}`, {
                headers: {
                    Authorization: `Bearer ${session.user.token}`,
                },
            });
            return response.data.data;
        },
        enabled: !!session,
    });
};
