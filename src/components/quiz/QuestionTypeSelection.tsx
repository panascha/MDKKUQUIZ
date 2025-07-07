import { ButtonWithLogo } from "../magicui/Buttonwithlogo";
import React from "react";

interface QuestionTypeSelectionProps {
    questionTypes: string[];
    selectedQuestionTypes: string;
    setSelectedQuestionTypes: (type: string) => void;
    selectCategory: String[];
}

const SelectableButton = ({ selected, onSelect, children, ...props }: { selected: boolean, onSelect: () => void, children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        className={`
            px-6 py-6 md:py-3 transition-transform duration-300 transform rounded-lg font-semibold
            focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm md:text-lg
            shadow-md
            ${selected ? 'ring-3 ring-orange-600 text-gray-900 shadow-lg bg-orange-100' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
            hover:scale-105
        `}
        onClick={onSelect}
        aria-pressed={selected}
        {...props}
    >
        {children}
    </button>
);

export const QuestionTypeSelection = ({
    questionTypes,
    selectedQuestionTypes,
    setSelectedQuestionTypes,
    selectCategory
}: QuestionTypeSelectionProps) => {
    return (
        <section className={`mb-8 animate-fade-in ${selectCategory.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Question Type</h2>
            <div className="grid grid-cols-2 gap-6">
                {questionTypes.map((type) => (
                    <SelectableButton
                        key={type}
                        selected={selectedQuestionTypes === type}
                        onSelect={() => setSelectedQuestionTypes(type)}
                        disabled={selectCategory.length === 0}
                    >
                        <span className="block md:inline">
                            {type === 'mcq' ? 'MCQ' : type === 'shortanswer' ? 'Short answer' : type}
                            <span className="inline md:hidden">{'\n'}</span>
                        </span>
                    </SelectableButton>
                ))}
            </div>
        </section>
    );
}; 