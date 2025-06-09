import { BackendRoutes } from "@/config/apiRoutes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export function useDeleteScore() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await axios.delete(`${BackendRoutes.SCORE}/${id}`,{
            headers: {
                Authorization: `Bearer ${session?.user.token}`,
                "Content-Type": "application/json",
            },});
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["scores"] });
            toast.success("Score deleted successfully!");
            window.location.reload(); 
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete score : ${error.message}`);
        },
    });
}