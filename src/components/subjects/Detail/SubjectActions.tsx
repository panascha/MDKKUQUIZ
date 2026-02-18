import Link from "next/link";

interface SubjectActionsProps {
    subjectId: string;
    canTakeQuiz?: boolean;
    isSAdmin?: boolean;
    allKeywordsUsed?: boolean;
}

export const SubjectActions = ({ subjectId, canTakeQuiz, isSAdmin, allKeywordsUsed }: SubjectActionsProps) => {
    const allowQuiz = isSAdmin || canTakeQuiz || allKeywordsUsed;
    return (
        <div className=" p-6 flex flex-col justify-center items-center mt-8 gap-6">
            <div className="relative flex flex-col items-center">
                <Link
                    href={allowQuiz ? `${subjectId}/setup-quiz` : "#"}
                    className={
                        `min-w-[200px] px-8 py-4 text-white text-xl font-bold rounded-xl shadow-lg transition duration-200 text-center flex items-center justify-center ` +
                        (allowQuiz
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95 hover:scale-105 focus:scale-105 ring-4 ring-blue-200"
                            : "bg-gray-300 cursor-not-allowed pointer-events-none")
                    }
                    aria-disabled={!allowQuiz}
                    tabIndex={allowQuiz ? 0 : -1}
                >
                    🎯 Take Quiz
                </Link>
                {allowQuiz && allKeywordsUsed && (
                    <span className="mt-2 text-green-600 text-sm font-medium">
                        🔓 ปลดล็อกเป็นพิเศษ: Keyword ในวิชานี้ถูกใช้จนครบแล้ว!
                    </span>
                )}
                {!allowQuiz && (
                    <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 bg-gray-800 text-white text-xs font-semibold rounded-lg px-3 py-2 shadow-xl whitespace-nowrap z-20 border border-gray-300">
                        ต้องสร้าง Quiz อย่างน้อย 4 ข้อ หรือใช้ Keyword ให้ครบทั้งวิชาเพื่อเข้าทำ
                    </span>
                )}
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <Link
                    href={`/question?subject=${subjectId}`}
                    className="min-w-[160px] cursor-pointer px-5 py-2.5 bg-gray-100 text-gray-700 text-base font-medium rounded-lg border border-gray-200 hover:bg-gray-200 hover:border-gray-300 transition duration-200 text-center flex items-center justify-center"
                >
                    📝 Explore Questionsss
                </Link>
                <Link
                    href={`/keyword?subject=${subjectId}`}
                    className="min-w-[160px] cursor-pointer px-5 py-2.5 bg-gray-100 text-gray-700 text-base font-medium rounded-lg border border-gray-200 hover:bg-gray-200 hover:border-gray-300 transition duration-200 text-center flex items-center justify-center"
                >
                    🔍 Explore Keywords
                </Link>
            </div>
        </div>
    );
};