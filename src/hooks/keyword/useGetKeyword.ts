import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { BackendRoutes } from '../../config/apiRoutes';

interface UseGetKeywordOptions {
    status?: 'pending' | 'approved' | 'rejected' | 'reported';
    isGlobal?: boolean;
}

export const useGetKeyword = (options?: UseGetKeywordOptions) => {
    const { data: session } = useSession();

    return useQuery({
        queryKey: ['keywords', options?.status, options?.isGlobal],
        queryFn: async () => {
            if (!session) throw new Error('No session');
                const response = await axios.get(BackendRoutes.KEYWORD, {
                    headers: {
                        Authorization: `Bearer ${session.user.token}`,
                    },
                params: {
                    status: options?.status,
                    isGlobal: options?.isGlobal
                }
            });
            return response.data.data;
        },
        enabled: !!session,
    });
};
