import { BackendRoutes } from "@/config/apiRoutes";
import { Category } from "@/types/api/Category";
import axios from "axios";
import { useSession } from "next-auth/react";

export const useGetCategory = async (): Promise<Array<Category>> => {
    const { data: session } = useSession();
    if (!session?.user.token) throw new Error("Authentication required");
    const response = await axios.get(BackendRoutes.CATEGORY, {
            headers: { Authorization: `Bearer ${session.user.token}` },
        });
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }
    throw new Error("Failed to fetch categories data");
}; 