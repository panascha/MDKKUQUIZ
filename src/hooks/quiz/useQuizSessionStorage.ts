import { useEffect } from 'react';
import { Question } from '../../types/api/Question';

interface UseQuizSessionStorageProps {
    subjectID: string;
    selectCategory: string[];
    selectedQuestionTypes: string;
    questionCount: number;
}

export const useQuizSessionStorage = ({
    subjectID,
    selectCategory,
    selectedQuestionTypes,
    questionCount
}: UseQuizSessionStorageProps) => {
    const getSessionKey = () => 
        `quiz_${subjectID}_${selectCategory.sort().join('_')}_${selectedQuestionTypes}_${questionCount}`;

    const getAnswersKey = () => `${getSessionKey()}_answers`;

    const saveAnswersToSession = (questions: Question[]) => {
        const answersKey = getAnswersKey();
        
        if (typeof window !== 'undefined') {
            try {
                const answersData = questions.map(q => ({
                    select: q.select,
                    isAnswered: q.isAnswered,
                    isBookmarked: q.isBookmarked,
                    isSubmitted: q.isSubmitted,
                    isCorrect: q.isCorrect
                }));
                sessionStorage.setItem(answersKey, JSON.stringify(answersData));
            } catch (error) {
                console.error('Error saving answers to sessionStorage:', error);
            }
        }
    };

    const loadAnswersFromSession = (questions: Question[]): Question[] => {
        const answersKey = getAnswersKey();
        const savedAnswers = typeof window !== 'undefined' ? sessionStorage.getItem(answersKey) : null;
        
        if (savedAnswers) {
            try {
                const parsedAnswers = JSON.parse(savedAnswers);
                return questions.map((question, index) => {
                    const savedAnswer = parsedAnswers[index];
                    if (savedAnswer) {
                        return {
                            ...question,
                            select: savedAnswer.select,
                            isAnswered: savedAnswer.isAnswered,
                            isBookmarked: savedAnswer.isBookmarked,
                            isSubmitted: savedAnswer.isSubmitted,
                            isCorrect: savedAnswer.isCorrect
                        };
                    }
                    return question;
                });
            } catch (error) {
                console.error('Error parsing saved answers:', error);
                return questions;
            }
        }
        return questions;
    };

    const clearQuizSession = () => {
        const sessionKey = getSessionKey();
        const answersKey = getAnswersKey();
        if (typeof window !== 'undefined') {
            try {
                sessionStorage.removeItem(sessionKey);
                sessionStorage.removeItem(answersKey);
            } catch (error) {
                console.error('Error clearing quiz session:', error);
            }
        }
    };

    return {
        saveAnswersToSession,
        loadAnswersFromSession,
        clearQuizSession,
        getSessionKey
    };
};
