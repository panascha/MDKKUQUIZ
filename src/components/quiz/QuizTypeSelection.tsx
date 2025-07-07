import { ButtonWithLogo } from "../magicui/Buttonwithlogo";
import { useCallback } from "react";
import React from "react";

type QuizType = "chillquiz" | "realtest" | "custom";
type AnswerModes = "reveal-at-end"| "reveal-after-each";

interface QuizTypeSelectionProps {
    quizTypes: QuizType[];
    quizType: string;
    setQuizType: (type: QuizType) => void;
    setQuestionCount: (count: number) => void;
    setAnswerMode: (mode: AnswerModes) => void;
    setSelectedQuestionTypes: (type: string) => void;
    selectCategory: String[];
    defaultValues_QuestionType: Record<QuizType, string>;
    defaultValues_AnswerMode: Record<QuizType, AnswerModes>;
    answerModes: AnswerModes[];
    quiz: any[];
    setMaxQuestions: (count: number) => void;
}

const SelectableButton = ({ selected, onSelect, children, ...props }: { selected: boolean, onSelect: () => void, children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        className={`
            px-2 py-4 transition-transform duration-300 transform rounded-lg font-semibold
            focus:outline-none focus:ring-2 focus:ring-orange-400
            shadow-md
            ${selected ? 'ring-3 ring-orange-600 text-gray-900 bg-orange-100' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
            hover:scale-105
        `}
        onClick={onSelect}
        aria-pressed={selected}
        {...props}
    >
        {children}
    </button>
);

export const QuizTypeSelection = ({
    quizTypes,
    quizType,
    setQuizType,
    setQuestionCount,
    setAnswerMode,
    setSelectedQuestionTypes,
    selectCategory,
    defaultValues_QuestionType,
    defaultValues_AnswerMode,
    answerModes,
    quiz,
    setMaxQuestions
}: QuizTypeSelectionProps) => {
    const handleQuizTypeChange = useCallback((type: QuizType) => {
        let filteredQuizzes = quiz.filter((item) => selectCategory.includes(item.category._id));
        let maxAvailable = 0;
        if (defaultValues_QuestionType[type] === 'mcq') {
            maxAvailable = filteredQuizzes.filter((item) => item.type === 'choice' || item.type === 'both').length;
        } else if (defaultValues_QuestionType[type] === 'shortanswer') {
            maxAvailable = filteredQuizzes.filter((item) => item.type === 'written' || item.type === 'both').length;
        } else {
            maxAvailable = filteredQuizzes.length;
        }
        setMaxQuestions(maxAvailable);

        let defaultCount = 0;
        if (type === 'chillquiz') {
            defaultCount = Math.min(10, Math.ceil(maxAvailable * 0.4));
        } else if (type === 'realtest') {
            defaultCount = maxAvailable;
        } else if (type === 'custom') {
            defaultCount = maxAvailable;
        }
        setQuizType(type);
        setQuestionCount(defaultCount);
        setAnswerMode(defaultValues_AnswerMode[type] || answerModes[0]);
        setSelectedQuestionTypes(defaultValues_QuestionType[type] || '');
    }, [defaultValues_QuestionType, defaultValues_AnswerMode, answerModes, quiz, selectCategory, setMaxQuestions, setQuizType, setQuestionCount, setAnswerMode, setSelectedQuestionTypes]);

    return (
        <section className={`mb-8 animate-fade-in ${selectCategory.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Choose Quiz Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {quizTypes.map((type) => (
                    <SelectableButton
                        key={type}
                        selected={quizType === type}
                        onSelect={() => handleQuizTypeChange(type)}
                        disabled={selectCategory.length === 0}
                    >
                        {type === 'chillquiz' ? 'Chill Quiz' : type === 'realtest' ? 'Real Test' : 'Custom Quiz'}
                    </SelectableButton>
                ))}
            </div>
        </section>
    );
}; 