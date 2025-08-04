import { Category } from "../../types/api/Category";
import { Quiz } from "../../types/api/Quiz";
import { useCallback } from "react";
import React from "react";

interface TopicSelectionProps {
    category: Category[];
    selectCategory: string[];
    setSelectCategory: (categories: string[] | ((prev: string[]) => string[])) => void;
    setMaxQuestions: (count: number) => void;
    quiz: Quiz[];
    selectedQuestionTypes: string;
}

const SelectableButton = ({ selected, onSelect, children, ...props }: { selected: boolean, onSelect: () => void, children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        className={`
            cursor-pointer px-4 py-2 rounded-lg text-lg shadow-md transition transform duration-300
            focus:outline-none
            ${selected ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:text-gray-900'}
            hover:scale-105
        `}
        onClick={onSelect}
        aria-pressed={selected}
        {...props}
    >
        {children}
    </button>
);

export const TopicSelection = ({
    category,
    selectCategory,
    setSelectCategory,
    setMaxQuestions,
    quiz,
    selectedQuestionTypes
}: TopicSelectionProps) => {
    const handleTopicToggle = useCallback((categoryId: string) => {
        // build new selection array
        const newSelection = selectCategory.includes(categoryId)
            ? selectCategory.filter((t) => t !== categoryId)
            : [...selectCategory, categoryId]
        // update categories
        setSelectCategory(newSelection)
        // Update maxQuestions based on the new selection
        const filteredQuizzes = quiz.filter((item: Quiz) => 
            newSelection.includes(item.category._id) && 
            (selectedQuestionTypes === 'mcq' ? item.type === "choice" : item.type === "written")
        );
        setMaxQuestions(filteredQuizzes.length)
    }, [quiz, selectedQuestionTypes, selectCategory, setSelectCategory, setMaxQuestions])

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
                {category.map((cat: Category) => {
                    const selectedIds: string[] = Array.isArray(selectCategory)
                        ? selectCategory
                        : (typeof selectCategory === 'string' ? [selectCategory] : [])
                    return (
                        <SelectableButton
                            key={cat._id}
                            selected={selectedIds.includes(cat._id)}
                            onSelect={() => handleTopicToggle(cat._id)}
                        >
                            {cat.category}
                        </SelectableButton>
                    )
                })}
            </div>
        </section>
    );
}; 