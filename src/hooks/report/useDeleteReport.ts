import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { BackendRoutes } from "../../config/apiRoutes";

export const useDeleteReport = () => {
    const session = useSession();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            if (!session?.data?.user.token) throw new Error("Authentication required");
            await axios.delete(`${BackendRoutes.REPORT}/${id}`, {
                headers: { Authorization: `Bearer ${session.data.user.token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["scores"] });
            toast.success("Report deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete report: ${error.message}`);
        },
    });
};
