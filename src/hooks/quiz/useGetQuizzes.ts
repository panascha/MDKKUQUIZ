import { BackendRoutes, getQuizByFilter } from "@/config/apiRoutes";
import { Quiz } from "@/types/api/Quiz";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

interface UseGetQuizzesProps {
  subjectID?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'reported';
  categoryID?: string;
  transformData?: (quizzes: Quiz[]) => any;
}

export const useGetQuizzes = ({ 
  subjectID, 
  status, 
  categoryID,
  transformData 
}: UseGetQuizzesProps = {}) => {
    const { data: session } = useSession();

  return useQuery({
    queryKey: ['quizzes', { subjectID, status, categoryID }],
    queryFn: async () => {
        if (!session?.user.token) throw new Error("Authentication required");

      const url = getQuizByFilter(subjectID, categoryID);
      const finalUrl = status ? `${url}?status=${status}` : url;
      
      const response = await axios.get(finalUrl, {
        headers: { Authorization: `Bearer ${session.user.token}` },
      });

      const quizzes = response.data.data as Quiz[];
      
      // Apply transformation if provided
      if (transformData) {
        return transformData(quizzes);
      }
      
      return quizzes;
    },
    enabled: !!session?.user.token,
  });
}; 