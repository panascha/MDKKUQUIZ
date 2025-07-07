import { ButtonWithLogo } from "../magicui/Buttonwithlogo";
import { useCallback } from "react";

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
        // Update maxQuestions based on selected categories and quiz type
        const filteredQuizzes = quiz.filter((item) => 
            selectCategory.includes(item.category._id) && 
            (defaultValues_QuestionType[type] === 'mcq' ? item.type === "choice" : item.type === "written")
        );
        const maxAvailable = filteredQuizzes.length;
        setMaxQuestions(maxAvailable);

        // Calculate default question count based on the type and available questions
        let defaultCount = 0;
        if (type === 'chillquiz') {
            defaultCount = Math.min(10, Math.ceil(maxAvailable * 0.3));
        } else if (type === 'realtest') {
            defaultCount = Math.min(30, Math.ceil(maxAvailable * 0.8));
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
                    <ButtonWithLogo
                        key={type}
                        className={`
                            px-2 py-4 transition-transform duration-300 transform hover:scale-105
                            focus:outline-none focus:ring-2 focus:ring-orange-400
                            ${quizType === type ? 'ring-3 ring-orange-600 text-gray-900' : ''}
                            ${selectCategory.length === 0 ? 'cursor-not-allowed' : ''}
                        `}
                        onClick={() => handleQuizTypeChange(type)}
                        aria-pressed={quizType === type}
                        disabled={selectCategory.length === 0}
                    >
                        {type === 'chillquiz' ? 'Chill Quiz' : type === 'realtest' ? 'Real Test' : 'Custom Quiz'}
                    </ButtonWithLogo>
                ))}
            </div>
        </section>
    );
}; 