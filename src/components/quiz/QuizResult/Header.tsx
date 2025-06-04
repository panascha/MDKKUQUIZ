import Link from 'next/link';
import { UserScore } from '@/types/api/Score';

interface QuizResultHeaderProps {
    score: UserScore | undefined;
    formatTime: (seconds: number) => string;
}

export const QuizResultHeader = ({ score, formatTime }: QuizResultHeaderProps) => {
    return (
        <>
            <div className="absolute text-lg font-bold top-20 md:top-22 left-8 md:left-10">
                <Link href="/" className="text-black hover:text-blue-500">
                    Back to Main Page
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-center mb-4">You nailed the quiz!</h1>

            <div className="bg-white md:shadow-md rounded-md p-6 w-96 border-none md:border-2 border-gray-300">
                <h2 className="text-xl font-bold mb-4">Quiz Result</h2>
                <p className="mb-2"><strong>Subject: </strong>{score?.Subject.name}</p>
                <p className="mb-2"><strong>Date / Time: </strong>{score?.createdAt ? new Date(score.createdAt).toLocaleString() : '' }</p>
                <p className="mb-2"><strong>Time Taken: </strong>{score?.timeTaken ? formatTime(Number(score.timeTaken)) : '00:00:00'}</p>
                <p className="mb-4 text-lg">
                    <strong>Score: </strong> <span id="score">{score?.Score.toString()}</span> / <span id="total">{score?.FullScore.toString()}</span>
                </p>
            </div>
        </>
    );
}; 