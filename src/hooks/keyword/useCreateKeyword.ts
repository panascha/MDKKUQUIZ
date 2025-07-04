import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { BackendRoutes } from "../../config/apiRoutes";

export interface CreateKeywordData {
  user: string;
  name: string;
  subject: string;
  category: string;
  keywords: Array<string>;
  status: 'pending' | 'approved' | 'rejected' | 'reported';
}

export const useCreateKeyword = () => {
    const session = useSession();
    return useMutation({
        mutationFn: async (keywordData: CreateKeywordData) => {
            if (!session?.data?.user.token) throw new Error("Authentication required");

            const response = await axios.post(BackendRoutes.KEYWORD, keywordData, {
                headers: {
                    Authorization: `Bearer ${session.data.user.token}`,
                    "Content-Type": "application/json",
                },
            });

            return response.data.data;
        },
    })
}