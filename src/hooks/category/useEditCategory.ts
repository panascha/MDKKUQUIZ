import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BackendRoutes } from "@/config/apiRoutes";
import { useSession } from "next-auth/react";

export interface EditCategoryData {
  subject: string;
  category: string;
  description: string;
}

export const useEditCategory = (categoryId: string) => {
    const session = useSession();
    return useMutation({
        mutationFn: async (categoryData: EditCategoryData) => {
            if (!session?.data?.user.token) throw new Error("Authentication required");

            const response = await axios.put(`${BackendRoutes.CATEGORY}/${categoryId}`, categoryData, {
                headers: {
                    Authorization: `Bearer ${session.data.user.token}`,
                    "Content-Type": "application/json",
                },
            });

            return response.data.data;
        },
    })
}