
import axios from "axios";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Category } from "../../types/api/Category";
import { BackendRoutes } from "../../config/apiRoutes";

export const useGetCategory = () => {
    const { data: session } = useSession();

    return useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: async () => {
            if (!session?.user.token) throw new Error("Authentication required");
            const response = await axios.get(BackendRoutes.CATEGORY, {
                headers: { Authorization: `Bearer ${session.user.token}` },
            });
            if (Array.isArray(response.data.data)) {
                return response.data.data;
            }
            throw new Error("Failed to fetch categories data");
        },
        enabled: !!session?.user.token
    });
}; 