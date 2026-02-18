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
        const activeElement = document.activeElement as HTMLElement;
        const isTyping = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');

        // --- Logic สำหรับปุ่มลูกศร ซ้าย/ขวา (เปลี่ยนข้อ) ---
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            // เงื่อนไขการเปลี่ยนข้อ: 
            // 1. ส่งคำตอบแล้ว (isSubmitted) -> เปลี่ยนได้เลยไม่ว่าจะ focus อะไรอยู่
            // 2. ยังไม่ส่ง แต่ไม่ได้ focus ที่ช่องพิมพ์ (!isTyping) -> เปลี่ยนได้
            const canNavigate = isSubmitted || !isTyping;

            if (canNavigate) {
                event.preventDefault(); // ป้องกันการเลื่อนหน้าจอ
                if (event.key === 'ArrowLeft' && currentQuestionIndex > 0) {
                    onNavigateQuestion('previous');
                } else if (event.key === 'ArrowRight' && currentQuestionIndex < totalQuestions - 1) {
                    onNavigateQuestion('next');
                }
            }
            // ถ้ากำลังพิมพ์และยังไม่ส่ง (canNavigate = false) 
            // จะไม่เข้าเงื่อนไขนี้ และปล่อยให้ลูกศรทำงานใน Textarea ตามปกติ
            return;
        }

        // --- Logic สำหรับปุ่มลูกศร บน/ล่าง (เลือก MCQ) ---
        // ทำงานเฉพาะเมื่อยังไม่ส่งคำตอบ และไม่ได้กำลังพิมพ์ข้อความ
        if (!isSubmitted && !isTyping && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            if (selectedQuestionTypes === 'mcq' && shuffledChoices.length > 0 && currentQuestion) {
                event.preventDefault();
                const currentSelectedIndex = shuffledChoices.findIndex(
                    choice => choice.choice === currentQuestion.select
                );

                let newIndex: number;
                if (event.key === 'ArrowUp') {
                    newIndex = currentSelectedIndex <= 0
                        ? shuffledChoices.length - 1
                        : currentSelectedIndex - 1;
                } else {
                    newIndex = currentSelectedIndex >= shuffledChoices.length - 1
                        ? 0
                        : currentSelectedIndex + 1;
                }

                onAnswerSelection(shuffledChoices[newIndex].choice);
            }
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
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return {
        currentSelectedIndex: currentQuestion && selectedQuestionTypes === 'mcq'
            ? shuffledChoices.findIndex(choice => choice.choice === currentQuestion.select)
            : -1
    };
}