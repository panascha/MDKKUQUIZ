import { BackendRoutes } from "@/config/apiRoutes";
import { Quiz } from "@/types/api/Quiz";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

export const useGetQuizzesOnlyPending = () => {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['pendingQuizzes'],
    queryFn: async () => {
      if (!session?.user.token) throw new Error("Authentication required");
      
      const response = await axios.get(`${BackendRoutes.QUIZ}/filter?status=pending`, {
        headers: { Authorization: `Bearer ${session.user.token}` },
      });
      return response.data.data as Quiz[];
    },
    enabled: !!session?.user.token,
  });
};