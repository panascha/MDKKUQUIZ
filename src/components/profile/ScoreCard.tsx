import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { UserScore } from "@/types/api/Score";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

interface ScoreCardProps {
  scores: UserScore[];
}

const ScoreCard: React.FC<ScoreCardProps> = ({ scores }) => {
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

  return (
    <Card className="w-full shadow-xl transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="border-b border-gray-100 bg-gray-50/50">
        <CardTitle className="text-xl font-bold text-gray-800">Your Scores</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          {Object.entries(scoresBySubject).map(([subjectName, subjectScores]) => (
            <div key={subjectName} className="space-y-4">
              <h3 className="text-lg font-semibold text-sky-700 border-b border-sky-100 pb-2">
                {subjectName}
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {subjectScores.map((score) => {
                  const percentageScore = calculatePercentage(score);
                  return (
                    <Link 
                      href={`/profile/${score._id}`} 
                      key={score._id}
                      className="block transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded-lg"
                    >
                      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                              Quiz: {score.Subject.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Date: {new Date(score.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Time Taken: {Number(score.timeTaken).toString()} seconds
                            </p>
                          </div>
                          <Badge
                            className={`transition-colors duration-300 ${
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
                        <div className="mt-4">
                          <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ease-out ${
                                percentageScore >= 80
                                  ? "bg-green-500"
                                  : percentageScore >= 60
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${percentageScore}%` }}
                            />
                          </div>
                        </div>
                        <div className="mt-4 space-y-1 text-sm text-gray-600">
                          <p className="font-medium">Score: {score.Score.toString()} / {score.FullScore.toString()}</p>
                          <p>Correct Answers: {score.Question.filter(q => q.isCorrect).length} / {score.Question.length}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreCard; 