import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { BackendRoutes } from "../../config/apiRoutes";

export interface CreateCategoryData {
  subject: string;
  category: string;
  description: string;
}

export const useCreateCategory = () => {
    const session = useSession();
    return useMutation({
        mutationFn: async (categoryData: CreateCategoryData) => {
            if (!session?.data?.user.token) throw new Error("Authentication required");

            const response = await axios.post(BackendRoutes.CATEGORY, categoryData, {
                headers: {
                    Authorization: `Bearer ${session.data.user.token}`,
                    "Content-Type": "application/json",
                },
            });

            return response.data.data;
        },
        onSuccess: () => {
            toast.success("Category deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete Category: ${error.message}`);
        },
    });
}