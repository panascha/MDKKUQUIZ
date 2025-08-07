"use client";
import { useEffect } from 'react';

interface UseQuizSessionStorageProps {
    subjectID: string;
    selectedQuestionTypes: string;
    questionCount: number;
    selectCategory: string[];
}

export function useQuizSessionStorage({
    subjectID,
    selectedQuestionTypes,
    questionCount,
    selectCategory
}: UseQuizSessionStorageProps) {
    // Cleanup session storage when component unmounts
    useEffect(() => {
        const sessionKey = `quiz_${subjectID}_${selectedQuestionTypes}_${questionCount}_${selectCategory.sort().join('_')}`;
        
        return () => {
            // Clear session storage when leaving the quiz
            try {
                // Clear main quiz data and progress
                sessionStorage.removeItem(sessionKey);
                sessionStorage.removeItem(`${sessionKey}_progress`);
                
                // Clear choice order for all questions
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    if (key && key.startsWith(`${sessionKey}_choice_order_`)) {
                        sessionStorage.removeItem(key);
                    }
                }
            } catch (error) {
                console.warn('Failed to clear session storage:', error);
            }
        };
    }, [subjectID, selectedQuestionTypes, questionCount, selectCategory]);

    const clearQuizSessionStorage = () => {
        const sessionKey = `quiz_${subjectID}_${selectedQuestionTypes}_${questionCount}_${selectCategory.sort().join('_')}`;
        try {
            // Clear main quiz data and progress
            sessionStorage.removeItem(sessionKey);
            sessionStorage.removeItem(`${sessionKey}_progress`);
            
            // Clear choice order for all questions
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith(`${sessionKey}_choice_order_`)) {
                    sessionStorage.removeItem(key);
                }
            }
        } catch (error) {
            console.warn('Failed to clear session storage:', error);
        }
    };

    return { clearQuizSessionStorage };
}
