
import axios from "axios";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BackendRoutes } from "../../config/apiRoutes";
import { UserScore } from "../../types/api/Score";
import { Question } from "../../types/api/Question";

interface SubmitScoreData {
    user: string;
    Subject: string;
    Category: string[];
    Score: number;
    FullScore: number;
    Question: Array<{
        Quiz: string;
        Answer: string;
        isCorrect: boolean;
        isBookmarked: boolean;
    }>;
    timeTaken: number;
}

export const useSubmitScore = () => {
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    const submitScore = async (scoreData: SubmitScoreData) => {
        if (!session?.user.token) throw new Error("Authentication required");
        
        const response = await axios.post(BackendRoutes.SCORE, scoreData, {
            headers: {
                Authorization: `Bearer ${session.user.token}`,
                "Content-Type": "application/json",
            },
        });
        return response.data.data;
    };

    const mutation = useMutation<UserScore, Error, SubmitScoreData>({
        mutationFn: submitScore,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["scores"] });
        },
    });

    const calculateScore = (questions: Question[], selectedQuestionTypes: string) => {
        let totalScore = 0;
        questions.forEach((question) => {
            let isCorrect = false;
            if (selectedQuestionTypes === 'mcq') {
                const userAnswer = question.select || '';
                const correctAnswers = question.quiz.correctAnswer || [];
                isCorrect = userAnswer !== '' && correctAnswers.includes(userAnswer);
            } else if (selectedQuestionTypes === 'shortanswer') {
                const userAnswer = question.select || '';
                const correctAnswers = question.quiz.correctAnswer || [];
                isCorrect = correctAnswers.some(correctAnswer => 
                    userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
                );
            }
            if (isCorrect) totalScore++;
        });
        return totalScore;
    };

    return {
        submitScore: mutation.mutateAsync,
        calculateScore,
        isLoading: mutation.isPending,
        error: mutation.error,
        scoreId: mutation.data?._id
    };
}; 