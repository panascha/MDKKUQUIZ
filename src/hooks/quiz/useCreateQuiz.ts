import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { BackendRoutes } from "../../config/apiRoutes";

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
  images?: File[];
}

export const useCreateQuiz = () => {
    const session = useSession();
    return useMutation({
        mutationFn: async (quizData: CreateQuizData) => {
            if (!session?.data?.user.token) throw new Error("Authentication required");

            const formData = new FormData();
            formData.append("user", quizData.user);
            formData.append("question", quizData.question);
            formData.append("subject", quizData.subject);
            formData.append("category", quizData.category);
            formData.append("type", quizData.type);
            formData.append("status", quizData.status);
            
            // Handle choices and correct answers
            quizData.choice.forEach((choice, index) => {
                formData.append(`choice[${index}]`, choice);
            });
            
            quizData.correctAnswer.forEach((answer, index) => {
                formData.append(`correctAnswer[${index}]`, answer);
            });

            // Handle multiple images if present
            if (quizData.images && quizData.images.length > 0) {
                quizData.images.forEach((image, index) => {
                    formData.append(`images`, image);
                });
            }

            const response = await axios.post(BackendRoutes.QUIZ, formData, {
                headers: {
                    Authorization: `Bearer ${session.data.user.token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data.data;
        },
    })
}