import { BackendRoutes } from "@/config/apiRoutes";
import { Category } from "@/types/api/Category";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

export const useGetCategoryBySubjectID = (subjectID: string) => {
    const { data: session } = useSession();
    
    return useQuery<Category[]>({
        queryKey: ["categories", "subject", subjectID],
        queryFn: async () => {
            if (!session?.user.token) throw new Error("Authentication required");
            
            const response = await axios.get(`${BackendRoutes.CATEGORY}/subject/${subjectID}`, {
                headers: { Authorization: `Bearer ${session.user.token}` },
            });
            return response.data.data as Category[];
        },
        enabled: !!session?.user.token && !!subjectID
    });
};