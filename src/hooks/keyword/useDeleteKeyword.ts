import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BackendRoutes } from "@/config/apiRoutes";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export const useDeleteKeyword = () => {
    const session = useSession();
    return useMutation({
        mutationFn: async (id: string) => {
            if (!session?.data?.user.token) throw new Error("Authentication required");
            await axios.delete(`${BackendRoutes.KEYWORD}/${id}`, {
                headers: { Authorization: `Bearer ${session.data.user.token}` },
            });
        },
        onSuccess: () => {
            toast.success("Keyword deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete keyword: ${error.message}`);
        },
    });
}; 