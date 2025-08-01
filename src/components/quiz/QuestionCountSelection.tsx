import { Quiz } from "../../types/api/Quiz";
import { useCallback, useEffect } from "react";

interface QuestionCountSelectionProps {
    questionCount: number;
    setQuestionCount: (count: number | ((prev: number) => number)) => void;
    selectCategory: String[];
    selectedQuestionTypes: string;
    filteredQuiz: Quiz[];
}

export const QuestionCountSelection = ({
    questionCount,
    setQuestionCount,
    selectCategory,
    selectedQuestionTypes,
    filteredQuiz
}: QuestionCountSelectionProps) => {
    // Calculate max available questions based on type
    const maxAvailableQuestions = selectedQuestionTypes.includes('mcq')
        ? filteredQuiz.filter((q: Quiz) => q.type === "choice" || q.type === "both").length
        : filteredQuiz.filter((q: Quiz) => q.type === "written" || q.type === "both").length;

    // Auto-limit questionCount if it exceeds the new maximum
    useEffect(() => {
        if (questionCount > maxAvailableQuestions) {
            setQuestionCount(maxAvailableQuestions);
        }
    }, [maxAvailableQuestions, questionCount, setQuestionCount]);

    const handleQuestionCountChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = Number(e.target.value);
            setQuestionCount(value > 0 ? Math.min(value, maxAvailableQuestions) : 0);
        },
        [maxAvailableQuestions, setQuestionCount]
    );

    return (
        <section className={`mb-8 animate-fade-in ${selectCategory.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Number of Questions</h2>
            <div className="flex items-center justify-center gap-4">
                <button
                    className={`cursor-pointer px-5 py-2 bg-gray-300 rounded-lg text-lg font-semibold transition-transform duration-300 transform hover:scale-105
                        ${selectCategory.length === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                    onClick={() => setQuestionCount((prev: number) => Math.max(0, prev - 5))}
                    aria-label="Decrease number of questions"
                    disabled={selectCategory.length === 0}
                >
                    -
                </button>
                <input
                    type="number"
                    className={`border border-gray-300 rounded-lg px-5 py-2 w-24 text-lg text-center focus:outline-none focus:ring-2 focus:ring-orange-400
                        ${selectCategory.length === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                    value={questionCount}
                    onChange={handleQuestionCountChange}
                    placeholder={`Max: ${selectedQuestionTypes.includes('mcq')
                        ? filteredQuiz.filter((q: Quiz) => q.type === "choice" || q.type === "both").length
                        : filteredQuiz.filter((q: Quiz) => q.type === "written" || q.type === "both").length}`}
                    min={0}
                    max={selectedQuestionTypes.includes('mcq')
                        ? filteredQuiz.filter((q: Quiz) => q.type === "choice" || q.type === "both").length
                        : filteredQuiz.filter((q: Quiz) => q.type === "written" || q.type === "both").length}
                    aria-label="Number of questions"
                    disabled={selectCategory.length === 0}
                />
                <button
                    className={`cursor-pointer px-5 py-2 bg-gray-300 rounded-lg text-lg font-semibold transition-transform duration-300 transform hover:scale-105
                        ${selectCategory.length === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                    onClick={() => setQuestionCount((prev: number) => Math.min(maxAvailableQuestions, prev + 5))}
                    aria-label="Increase number of questions"
                    disabled={selectCategory.length === 0}
                >
                    +
                </button>
                <button
                    className={`cursor-pointer px-5 py-2 bg-gray-300 rounded-lg text-lg font-semibold transition-transform duration-300 transform hover:scale-105
                        ${selectCategory.length === 0 || maxAvailableQuestions === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                    onClick={() => setQuestionCount(maxAvailableQuestions)}
                    aria-label="Max questions"
                    disabled={selectCategory.length === 0 || maxAvailableQuestions === 0}
                >
                    Max
                </button>
            </div>
            <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto text-center">
                {selectedQuestionTypes.includes('mcq') && `MCQ Questions Available: ${filteredQuiz.filter((q: Quiz) => q.type === "choice" || q.type === "both").length}`}
                {selectedQuestionTypes.includes('shortanswer') && `Short Answer Questions Available: ${filteredQuiz.filter((q: Quiz) => q.type === "written" || q.type === "both").length}`}
            </p>
        </section>
    );
}; 