import { ButtonWithLogo } from "@/components/magicui/Buttonwithlogo";

interface QuestionTypeSelectionProps {
    questionTypes: string[];
    selectedQuestionTypes: string;
    setSelectedQuestionTypes: (type: string) => void;
    selectCategory: String[];
}

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
                    <ButtonWithLogo
                        key={type}
                        className={`
                            px-6 py-6 md:py-3 transition-transform duration-300 transform hover:scale-105
                            focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm md:text-lg
                            ${selectedQuestionTypes === type ? 'ring-3 ring-orange-600 text-gray-900 shadow-lg' : ''}
                            ${selectCategory.length === 0 ? 'cursor-not-allowed' : ''}
                        `}
                        onClick={() => setSelectedQuestionTypes(type)}
                        aria-pressed={selectedQuestionTypes === type}
                        disabled={selectCategory.length === 0}
                    >
                        <span className="block md:inline">
                            {type === 'mcq' ? 'MCQ' : type === 'shortanswer' ? 'Short answer' : type}
                            <span className="inline md:hidden">{'\n'}</span>
                        </span>
                    </ButtonWithLogo>
                ))}
            </div>
        </section>
    );
}; 