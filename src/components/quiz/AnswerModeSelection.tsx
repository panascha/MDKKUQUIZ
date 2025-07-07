import { ButtonWithLogo } from "../magicui/Buttonwithlogo";
import React from "react";

type AnswerModes = "reveal-at-end"| "reveal-after-each";

interface AnswerModeSelectionProps {
    answerModes: AnswerModes[];
    answerMode: string;
    setAnswerMode: (mode: AnswerModes) => void;
    selectCategory: String[];
}

const SelectableButton = ({ selected, onSelect, children, ...props }: { selected: boolean, onSelect: () => void, children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        className={`
            px-6 py-3 transition-transform duration-300 transform rounded-lg font-semibold
            focus:outline-none focus:ring-2 focus:ring-orange-400
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

export const AnswerModeSelection = ({
    answerModes,
    answerMode,
    setAnswerMode,
    selectCategory
}: AnswerModeSelectionProps) => {
    return (
        <section className={`mb-8 animate-fade-in ${selectCategory.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Answer Mode</h2>
            <div className="grid grid-cols-2 gap-6">
                {answerModes.map((mode) => (
                    <SelectableButton
                        key={mode}
                        selected={answerMode === mode}
                        onSelect={() => setAnswerMode(mode)}
                        disabled={selectCategory.length === 0}
                    >
                        <span className="block md:inline">
                            {mode.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            <span className="inline md:hidden">{'\n'}</span>
                        </span>
                    </SelectableButton>
                ))}
            </div>
        </section>
    );
}; 