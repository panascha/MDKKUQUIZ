"use client";
import { useEffect, useCallback } from 'react';
import { Question } from '../../types/api/Question';

interface UseQuizKeyboardNavigationProps {
    currentQuestion: Question | undefined;
    currentQuestionIndex: number;
    totalQuestions: number;
    selectedQuestionTypes: string;
    shuffledChoices: Array<{ choice: string; originalIndex: number }>;
    onNavigateQuestion: (direction: 'next' | 'previous') => void;
    onAnswerSelection: (answer: string) => void;
    isSubmitted?: boolean;
}

export function useQuizKeyboardNavigation({
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    selectedQuestionTypes,
    shuffledChoices,
    onNavigateQuestion,
    onAnswerSelection,
    isSubmitted = false
}: UseQuizKeyboardNavigationProps) {
    
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Prevent default behavior for arrow keys
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
        }

        // Don't handle keyboard events if question is already submitted
        if (isSubmitted) return;

        switch (event.key) {
            case 'ArrowLeft':
                // Navigate to previous question
                if (currentQuestionIndex > 0) {
                    onNavigateQuestion('previous');
                }
                break;
                
            case 'ArrowRight':
                // Navigate to next question
                if (currentQuestionIndex < totalQuestions - 1) {
                    onNavigateQuestion('next');
                }
                break;
                
            case 'ArrowUp':
            case 'ArrowDown':
                // Handle answer selection for MCQ
                if (selectedQuestionTypes === 'mcq' && shuffledChoices.length > 0 && currentQuestion) {
                    const currentSelectedIndex = shuffledChoices.findIndex(
                        choice => choice.choice === currentQuestion.select
                    );
                    
                    let newIndex: number;
                    if (event.key === 'ArrowUp') {
                        // Move up in the list (decrease index)
                        newIndex = currentSelectedIndex <= 0 
                            ? shuffledChoices.length - 1 
                            : currentSelectedIndex - 1;
                    } else {
                        // Move down in the list (increase index)
                        newIndex = currentSelectedIndex >= shuffledChoices.length - 1 
                            ? 0 
                            : currentSelectedIndex + 1;
                    }
                    
                    onAnswerSelection(shuffledChoices[newIndex].choice);
                }
                break;
                
            default:
                break;
        }
    }, [
        currentQuestion,
        currentQuestionIndex,
        totalQuestions,
        selectedQuestionTypes,
        shuffledChoices,
        onNavigateQuestion,
        onAnswerSelection,
        isSubmitted
    ]);

    useEffect(() => {
        // Add event listener
        document.addEventListener('keydown', handleKeyDown);
        
        // Cleanup
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return {
        // Return current selection info for UI feedback
        currentSelectedIndex: currentQuestion && selectedQuestionTypes === 'mcq' 
            ? shuffledChoices.findIndex(choice => choice.choice === currentQuestion.select)
            : -1
    };
}
