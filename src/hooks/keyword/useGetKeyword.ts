import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { BackendRoutes } from '@/config/apiRoutes';
import { Keyword } from '@/types/api/Keyword';
import { Role_type } from '@/config/role';

interface UseGetKeywordsResult {
    keywords: Keyword[];
    isLoading: boolean;
    error: string | null;
}

export const useGetKeywords = (): UseGetKeywordsResult => {
    const { data: session } = useSession();
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check if user is admin or S-admin
    const isAdmin = session?.user.role === Role_type.ADMIN || session?.user.role === Role_type.SADMIN;

    useEffect(() => {
        if (!session) return;

        const fetchKeywords = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(BackendRoutes.KEYWORD, {
                    headers: {
                        Authorization: `Bearer ${session.user.token}`,
                    },
                });
                // Filter keywords based on user role
                const Keywords = response.data.data 
                setKeywords(Keywords);
                console.log("Fetched keywords:", Keywords);
                setIsLoading(false);
            }
            catch (err) {
                setError("Failed to fetch keywords.");
                setIsLoading(false);
            }
        };

        fetchKeywords();
    }, [session, isAdmin]);

    return { keywords, isLoading, error };
};
