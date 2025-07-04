import { ButtonWithLogo } from "../../components/magicui/Buttonwithlogo";

type AnswerModes = "reveal-at-end"| "reveal-after-each";

interface AnswerModeSelectionProps {
    answerModes: AnswerModes[];
    answerMode: string;
    setAnswerMode: (mode: AnswerModes) => void;
    selectCategory: String[];
}

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
                    <ButtonWithLogo
                        key={mode}
                        className={`
                            px-6 py-3 transition-transform duration-300 transform hover:scale-105
                            focus:outline-none focus:ring-2 focus:ring-orange-400
                            ${answerMode === mode ? 'ring-3 ring-orange-600 text-gray-900 shadow-lg' : ''}
                            ${selectCategory.length === 0 ? 'cursor-not-allowed' : ''}
                        `}
                        onClick={() => setAnswerMode(mode)}
                        aria-pressed={answerMode === mode}
                        disabled={selectCategory.length === 0}
                    >
                        <span className="block md:inline">
                            {mode.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            <span className="inline md:hidden">{'\n'}</span>
                        </span>
                    </ButtonWithLogo>
                ))}
            </div>
        </section>
    );
}; 