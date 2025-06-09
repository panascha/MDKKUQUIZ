import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BackendRoutes } from "@/config/apiRoutes";
import { useSession } from "next-auth/react";
import { Quiz } from "@/types/api/Quiz";

export const useCreateQuiz = (reportData:Report) => {
    const session = useSession();
    return useMutation({
        mutationFn: async () => {
            if (!session?.data?.user.token) throw new Error("Authentication required");

            const response = await axios.post(BackendRoutes.REPORT, reportData, {
                headers: {
                Authorization: `Bearer ${session.data.user.token}`,
                "Content-Type": "multipart/form-data",
                },
            });

            return response.data.data;
        },
    })
}