import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BackendRoutes } from "@/config/apiRoutes";
import { useSession } from "next-auth/react";
import { Report } from "@/types/api/Report";

export const useCreateReport = () => {
    const session = useSession();
    return useMutation({
        mutationFn: async (reportData: Omit<Report, '_id' | 'createdAt'>) => {
            if (!session?.data?.user.token) throw new Error("Authentication required");

            const response = await axios.post(BackendRoutes.REPORT, reportData, {
                headers: {
                    Authorization: `Bearer ${session.data.user.token}`,
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true"
                },
            });

            return response.data.data;
        },
    });
};