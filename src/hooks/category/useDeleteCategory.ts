import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { BackendRoutes } from "../../config/apiRoutes";

export const useDeleteCategory = () => {
    const session = useSession();
    return useMutation({
        mutationFn: async (id: string) => {
            if (!session?.data?.user.token) throw new Error("Authentication required");
            await axios.delete(`${BackendRoutes.CATEGORY}/${id}`, {
                headers: { Authorization: `Bearer ${session.data.user.token}` },
            });
        },
        onSuccess: () => {
            toast.success("Category deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete Category: ${error.message}`);
        },
    });
}; 