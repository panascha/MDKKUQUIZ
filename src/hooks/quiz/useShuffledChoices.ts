"use client";
import { useMemo } from 'react';
import { Question } from '../../types/api/Question';

interface UseShuffledChoicesProps {
    currentQuestion: Question | undefined;
    selectedQuestionTypes: string;
    subjectID: string;
    questionCount: number;
    selectCategory: string[];
}

export function useShuffledChoices({
    currentQuestion,
    selectedQuestionTypes,
    subjectID,
    questionCount,
    selectCategory
}: UseShuffledChoicesProps) {
    const shuffledChoices = useMemo(() => {
        if (!currentQuestion || selectedQuestionTypes !== 'mcq') return [];
        
        const sessionKey = `quiz_${subjectID}_${selectedQuestionTypes}_${questionCount}_${selectCategory.sort().join('_')}`;
        const choiceOrderKey = `${sessionKey}_choice_order_${currentQuestion.quiz._id}`;
        
        // Check if we have saved choice order for this question
        const savedChoiceOrder = sessionStorage.getItem(choiceOrderKey);
        if (savedChoiceOrder) {
            try {
                const parsedOrder = JSON.parse(savedChoiceOrder);
                // Validate that the saved order is still valid
                if (parsedOrder.length === currentQuestion.quiz.choice.length) {
                    return parsedOrder;
                }
            } catch (error) {
                console.warn('Failed to parse saved choice order:', error);
            }
        }
        
        // Create a copy of choices with their indices
        const choicesWithIndices = currentQuestion.quiz.choice.map((choice, index) => ({
            choice,
            originalIndex: index
        }));
        
        // Shuffle the choices
        const shuffledChoicesWithIndices = [...choicesWithIndices].sort(() => Math.random() - 0.5);
        
        // Save the shuffled order to session storage
        try {
            sessionStorage.setItem(choiceOrderKey, JSON.stringify(shuffledChoicesWithIndices));
        } catch (error) {
            console.warn('Failed to save choice order to session storage:', error);
        }
        
        return shuffledChoicesWithIndices;
    }, [currentQuestion, selectedQuestionTypes, subjectID, questionCount, selectCategory]);

    return shuffledChoices;
}
