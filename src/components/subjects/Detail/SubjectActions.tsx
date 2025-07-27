import Link from "next/link";

interface SubjectActionsProps {
    subjectId: string;
    canTakeQuiz?: boolean;
    isSAdmin?: boolean;
}

export const SubjectActions = ({ subjectId, canTakeQuiz = true, isSAdmin = false }: SubjectActionsProps) => {
    const allowQuiz = isSAdmin || canTakeQuiz;
    return (
        <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col sm:flex-row justify-center items-center mt-8 gap-4 sm:gap-6 border border-gray-100">
            <div className="relative flex flex-col items-center">
            <Link
                    href={allowQuiz ? `${subjectId}/quiz` : "#"}
                    className={
                        `min-w-[180px] px-6 py-3 text-white text-lg font-semibold rounded-lg shadow-md transition duration-200 text-center flex items-center justify-center ` +
                        (allowQuiz
                            ? "bg-blue-600 hover:bg-blue-700 active:scale-95 hover:scale-105 focus:scale-105"
                            : "bg-gray-300 cursor-not-allowed pointer-events-none")
                    }
                    aria-disabled={!allowQuiz}
                    tabIndex={allowQuiz ? 0 : -1}
            >
                Take Quiz
            </Link>
                {!isSAdmin && !canTakeQuiz && (
                    <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 bg-gray-800 text-white text-xs font-semibold rounded-lg px-3 py-2 shadow-xl whitespace-nowrap z-20 border border-gray-300 animate-fade-in">
                        You must create at least 4 quizzes to take a quiz
                    </span>
                )}
            </div>
            <Link
                href={`/question?subject=${subjectId}`}
                className="min-w-[180px] cursor-pointer px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-700 active:scale-95 hover:scale-105 focus:scale-105 transition duration-200 text-center flex items-center justify-center"
            >
                Explore Question
            </Link>
            <Link
                href={`/keyword?subject=${subjectId}`}
                className="min-w-[180px] cursor-pointer px-6 py-3 bg-yellow-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-yellow-600 active:scale-95 hover:scale-105 focus:scale-105 transition duration-200 text-center flex items-center justify-center"
            >
                Explore Keyword
            </Link>
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.2s ease; }
            `}</style>
        </div>
    );
}; 