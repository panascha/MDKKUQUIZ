import { BackendRoutes } from "@/config/apiRoutes";
import { Category } from "@/types/api/Category";
import axios from "axios";
import { useSession } from "next-auth/react";

export const useGetCategoryBySubjectID = (subjectID: string) => {
    const { data: session } = useSession();
    
    return async () => {
        if (!session?.user.token) throw new Error("Authentication required");
        
        const response = await axios.get(`${BackendRoutes.CATEGORY}/subject/${subjectID}`, {
            headers: {
                Authorization: `Bearer ${session.user.token}`,
                "ngrok-skip-browser-warning": "true"
            },
        });
        return response.data.data as Category[];
    };
};