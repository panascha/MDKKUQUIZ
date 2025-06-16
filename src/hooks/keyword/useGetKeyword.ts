import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { BackendRoutes } from '@/config/apiRoutes';
import { Keyword } from '@/types/api/Keyword';

interface UseGetKeywordOptions {
    status?: 'pending' | 'approved' | 'rejected' | 'reported';
}

export const useGetKeyword = (options?: UseGetKeywordOptions) => {
    const { data: session } = useSession();

    return useQuery({
        queryKey: ['keywords', options?.status],
        queryFn: async () => {
            if (!session) throw new Error('No session');
                const response = await axios.get(BackendRoutes.KEYWORD, {
                    headers: {
                        Authorization: `Bearer ${session.user.token}`,
                        "ngrok-skip-browser-warning": "true"
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
