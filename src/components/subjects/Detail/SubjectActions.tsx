import Link from "next/link";

interface SubjectActionsProps {
    subjectId: string;
}

export const SubjectActions = ({ subjectId }: SubjectActionsProps) => {
    return (
        <div className="flex flex-col sm:flex-row justify-center mt-8 gap-4 sm:gap-6">
            <Link
                href={`${subjectId}/quiz`}
                className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out text-center"
            >
                Take Quiz
            </Link>
            <Link
                href={`/question?subject=${subjectId}`}
                className="cursor-pointer px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out text-center"
            >
                Explore Question
            </Link>
            <Link
                href={`/keyword?subject=${subjectId}`}
                className="cursor-pointer px-6 py-3 bg-yellow-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-yellow-700 transition duration-300 ease-in-out text-center"
            >
                Explore Keyword
            </Link>
        </div>
    );
}; 