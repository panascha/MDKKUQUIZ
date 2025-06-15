import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { UserScore } from "@/types/api/Score";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { XIcon } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { Role_type } from '@/config/role';
import { useDeleteScore } from '@/hooks/score/useDeleteScore';

interface ScoreCardProps {
  scores: UserScore[];
}

const ScoreCard: React.FC<ScoreCardProps> = ({ scores }) => {
  const deleteScore = useDeleteScore();
  // Group scores by subject
  const scoresBySubject = scores.reduce((acc, score) => {
    const subjectName = score.Subject.name;
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(score);
    return acc;
  }, {} as Record<string, UserScore[]>);

  // Calculate percentage score
  const calculatePercentage = (score: UserScore) => {
    return Math.round((Number(score.Score) / Number(score.FullScore)) * 100);
  };

  // Format time taken
  const formatTimeTaken = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const [showAll, setShowAll] = useState(false);

  return (
    <Card className="w-full shadow-xl transition-all duration-300 hover:shadow-2xl bg-white/50 backdrop-blur-sm ">
      <CardHeader className="border-b border-gray-100 px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-sky-800">Your Scores</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-8 sm:space-y-10">
          {Object.entries(scoresBySubject).map(([subjectName, subjectScores]) => {
        const visibleScores = showAll ? subjectScores.slice().reverse() : subjectScores.slice().reverse().slice(0, 3);

        return (
          <div key={subjectName} className="space-y-3 sm:space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-sky-700 border-b border-sky-100 pb-2 flex items-center gap-2">
          <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-sky-500"></span>
          {subjectName}
        </h3>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {visibleScores.map((score) => {
        const percentageScore = calculatePercentage(score);
        return (
          <div key={score._id} className="relative group">
        <Link 
          href={`/profile/${score._id}`} 
          className="block transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded-lg"
        >
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-sky-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
          <div className="space-y-1.5 sm:space-y-2">
            <p className="text-sm font-medium text-gray-700">
          Quiz: {score.Subject.name}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
          Date: {new Date(score.createdAt).toLocaleDateString()}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
          Time Taken: {formatTimeTaken(Number(score.timeTaken))}
            </p>
          </div>
          <Badge
            className={`transition-colors duration-300 text-xs sm:text-sm ${
          percentageScore >= 80
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : percentageScore >= 60
            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            : "bg-red-100 text-red-800 hover:bg-red-200"
            }`}
          >
            {percentageScore}%
          </Badge>
            </div>
            <div className="mt-3 sm:mt-4">
          <div className="h-2 sm:h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            percentageScore >= 80
          ? "bg-gradient-to-r from-green-400 to-green-500"
          : percentageScore >= 60
          ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
          : "bg-gradient-to-r from-red-400 to-red-500"
          }`}
          style={{ width: `${percentageScore}%` }}
            />
          </div>
            </div>
            <div className="mt-3 sm:mt-4 space-y-1 text-xs sm:text-sm text-gray-600">
          <p className="font-medium">Score: {score.Score.toString()} / {score.FullScore.toString()}</p>
            </div>
          </div>
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteScore.mutate(score._id);
          }}
          disabled={deleteScore.isPending}
          className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full hover:bg-red-600 disabled:opacity-50 transition-all duration-300 opacity-100 sm:opacity-0 group-hover:opacity-100 hover:scale-110 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
          <XIcon size={14} className="sm:w-4 sm:h-4" />
        </button>
          </div>
        );
          })}
        </div>
        {subjectScores.length > 3 && (
          <button
        onClick={() => setShowAll(!showAll)}
        className="text-sky-500 hover:text-sky-700 transition-colors duration-300 block text-sm font-medium"
          >
        {showAll ? "Show Less" : `Show All (${subjectScores.length})`}
          </button>
        )}
          </div>
        );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreCard;