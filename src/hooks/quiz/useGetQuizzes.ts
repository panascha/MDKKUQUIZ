import { BackendRoutes } from "@/config/apiRoutes";
import { Question } from "@/types/api/Question";
import { Quiz } from "@/types/api/Quiz";
import { Subject } from "@/types/api/Subject";
import axios from "axios";
import { useSession } from "next-auth/react";

interface UseGetQuestionsProps {
    subjectID: string;
    selectCategory: string[];
    selectedQuestionTypes: string;
    questionCount: number;
}

export const useGetQuestions = ({ subjectID, selectCategory, selectedQuestionTypes, questionCount }: UseGetQuestionsProps) => {
    const { data: session } = useSession();

    const fetchQuestions = async () => {
        if (!session?.user.token) throw new Error("Authentication required");

        const [quizResponse, subjectResponse] = await Promise.all([
            axios.get(
                BackendRoutes.QUIZ_FILTER.replace(":subjectID", String(subjectID)),
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.user.token}`,
                    },
                }
            ),
            axios.get(
                `${BackendRoutes.SUBJECT}/${subjectID}`,
                {
                    headers: {
                        Authorization: `Bearer ${session.user.token}`,
                    },
                }
            )
        ]);

        const mapToQuestion = (data: Quiz[]): Question[] => {
            return data.map((item) => ({
                quiz: item,
                select: null,
                isBookmarked: false,
                isAnswered: false,
                isSubmitted: false,
                isCorrect: null,
            }));
        };

        const shuffleArray = <T,>(array: T[]): T[] => {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        };

        const allQuestions = mapToQuestion(quizResponse.data.data);

        const filteredQuestions = allQuestions.filter((q) => {
            const categoryMatch = selectCategory.includes(q.quiz.category._id);
            const typeMatch = selectedQuestionTypes === 'mcq' ? 
                q.quiz.type === 'choice' : 
                q.quiz.type === "written";
            return categoryMatch && typeMatch;
        });

        const shuffledQuestions = shuffleArray(filteredQuestions);
        const limitedQuestions = shuffledQuestions.slice(0, questionCount);

        return {
            questions: limitedQuestions,
            subject: subjectResponse.data.data as Subject
        };
    };

    return fetchQuestions;
}; 