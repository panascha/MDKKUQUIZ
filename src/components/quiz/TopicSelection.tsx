import { Category } from "@/types/api/Category";
import { Quiz } from "@/types/api/Quiz";
import { useCallback } from "react";

interface TopicSelectionProps {
    category: Category[];
    selectCategory: String[];
    setSelectCategory: (categories: String[] | ((prev: String[]) => String[])) => void;
    setMaxQuestions: (count: number) => void;
    quiz: Quiz[];
    selectedQuestionTypes: string;
}

export const TopicSelection = ({
    category,
    selectCategory,
    setSelectCategory,
    setMaxQuestions,
    quiz,
    selectedQuestionTypes
}: TopicSelectionProps) => {
    const handleTopicToggle = useCallback((categoryId: string) => {
        setSelectCategory((prev: String[]) => {
            const newSelection = prev.includes(categoryId) 
                ? prev.filter((t: String) => t !== categoryId) 
                : [...prev, categoryId];
            
            // Update maxQuestions based on the new selection
            const filteredQuizzes = quiz.filter((item: Quiz) => 
                newSelection.includes(item.category._id) && 
                (selectedQuestionTypes === 'mcq' ? item.type === "choice" : item.type === "written")
            );
            setMaxQuestions(filteredQuizzes.length);
            
            return newSelection;
        });
    }, [quiz, selectedQuestionTypes, setSelectCategory, setMaxQuestions]);

    return (
        <section className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-semibold text-gray-800">Select Topics</h2>
                <button
                    className="cursor-pointer px-5 py-2 rounded-lg text-lg bg-yellow-500 text-white shadow-md hover:bg-yellow-600 transition transform hover:scale-105 duration-300"
                    onClick={() => {
                        if (selectCategory.length === category.length) {
                            setSelectCategory([]);
                            setMaxQuestions(0);
                        } else {
                            // Select all categories
                            const allCategoryIds = category.map((cat: Category) => cat._id);
                            setSelectCategory(allCategoryIds);
                            const filteredQuizzes = quiz.filter((item: Quiz) => 
                                allCategoryIds.includes(item.category._id) && 
                                (selectedQuestionTypes === 'mcq' ? item.type === "choice" : item.type === "written")
                            );
                            setMaxQuestions(filteredQuizzes.length);
                        }
                    }}
                    aria-label="Toggle select all topics"
                >
                    {selectCategory.length === category.length ? 'Deselect All' : 'Select All'}
                </button>
            </div>
            <div className="flex flex-wrap gap-4">
                {category.map((cat: Category) => (
                    <button
                        key={cat._id}
                        className={`
                            cursor-pointer px-4 py-2 rounded-lg text-lg bg-gray-200 text-gray-800 shadow-md hover:bg-gray-300 hover:text-gray-900 transition transform hover:scale-105 duration-300
                            focus:outline-none
                            ${selectCategory.includes(String(cat._id)) ? 'bg-orange-500 text-white' : ''}
                        `}
                        onClick={() => handleTopicToggle(cat._id)}
                        aria-pressed={selectCategory.includes(String(cat._id))}
                    >
                        {cat.category}
                    </button>
                ))}
            </div>
        </section>
    );
}; 