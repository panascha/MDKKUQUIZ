import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { BackendRoutes } from "../../config/apiRoutes";
import { uploadImageToBackend } from "../../lib/utils";

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
            if (!session?.data?.user?.token) throw new Error("Authentication required");

            const imgUrls: string[] = quizData.img ? [...quizData.img] : [];
            if (quizData.images && quizData.images.length > 0) {
                const uploaded = await Promise.all(
                    quizData.images.map(file => uploadImageToBackend(file, session.data.user.token!))
                );
                imgUrls.push(...uploaded);
            }

            const payload = {
                ...quizData,
                img: imgUrls,
            };

            const response = await axios.post(BackendRoutes.QUIZ, payload, {
                headers: {
                    Authorization: `Bearer ${session.data.user.token}`,
                },
            });

            return response.data.data;
        },
    })
}