import ImageGallery from '@/components/magicui/ImageGallery';
import { Question } from '@/types/api/Score';

interface QuizQuestionCardProps {
    question: Question;
    index: number;
}

export const QuizQuestionCard = ({ question, index }: QuizQuestionCardProps) => {
    return (
        <div
            className={`card ${!question.isCorrect ? 'bg-red-100' : 'bg-green-100'} shadow-md rounded-lg p-6 border-gray-400 border-2 relative`}
        >
            <div className={`absolute top-0 left-0 h-full w-1.5 ${!question.isCorrect ? 'bg-red-600' : 'bg-green-600'} rounded-l-md`} />
            <h3 className="text-lg font-bold mb-1 question-text">Question {index + 1}</h3>
            <p className="mb-2"><strong>Topic:</strong> {question.Quiz.category.category}</p>
            <p className="mb-3 text-center text-xl font-semibold">
                {question.Quiz.question}
            </p>
            <div className="flex flex-col md:flex-row items-center gap-8 ml-4 md:gap-6 md:justify-between">
                <ImageGallery images={question.Quiz.img} />
                <div className="md:order-2 md:w-2/3">
                    <p className="mb-1"><strong>Your Answer: </strong>{question.Answer}</p>
                    <p className="mb-1"><strong>Correct answer: </strong>{question.Quiz.correctAnswer}</p>
                </div>
            </div>
            <div className="flex justify-end mt-4 md:mt-0 md:order-3">
                <button className="bg-orange-400 text-white rounded-md p-2 cursor-pointer hover:bg-orange-600 transition duration-300 ease-in-out">
                    Report
                </button>
            </div>
        </div>
    );
}; 