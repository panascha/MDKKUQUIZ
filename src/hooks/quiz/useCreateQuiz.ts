import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BackendRoutes } from "@/config/apiRoutes";
import { useSession } from "next-auth/react";
import { Quiz } from "@/types/api/Quiz";

export interface CreateQuizData {
  user: string;
  subject: string;
  category: string;
  choice: Array<string>;
  correctAnswer: Array<string>;
  img: Array<string>;
  question: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected' | 'reported';
}

export const useCreateQuiz = () => {
    const session = useSession();
    return useMutation({
        mutationFn: async (quizData: CreateQuizData) => {
            if (!session?.data?.user.token) throw new Error("Authentication required");

            const response = await axios.post(BackendRoutes.QUIZ, quizData, {
                headers: {
                Authorization: `Bearer ${session.data.user.token}`,
                "Content-Type": "multipart/form-data",
                },
            });

            return response.data.data;
        },
    })
}