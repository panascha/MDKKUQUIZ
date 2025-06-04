import { BackendRoutes } from "@/config/apiRoutes";
import { Quiz } from "@/types/api/Quiz";
import axios from "axios";
import { useSession } from "next-auth/react";

export const useGetQuizBySubjectId = (subjectID: string) => {
  const { data: session } = useSession();
  
  return async () => {
    if (!session?.user.token) throw new Error("Authentication required");
    
    const response = await axios.get(`${BackendRoutes.QUIZ}/filter/${subjectID}`, {
      headers: { Authorization: `Bearer ${session.user.token}` },
    });
    return response.data.data as Quiz[];
  };
};