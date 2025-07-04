import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Report } from "../../types/api/Report";
import { BackendRoutes } from "../../config/apiRoutes";

export const useCreateReport = () => {
    const session = useSession();
    return useMutation({
        mutationFn: async (reportData: Omit<Report, '_id' | 'createdAt' | 'updatedAt'>) => {
            if (!session?.data?.user.token) throw new Error("Authentication required");

            const response = await axios.post(BackendRoutes.REPORT, reportData, {
                headers: {
                    Authorization: `Bearer ${session.data.user.token}`,
                    "Content-Type": "application/json",
                },
            });

            return response.data.data;
        },
    });
};