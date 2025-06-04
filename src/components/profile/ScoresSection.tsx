import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { UserScore } from "@/types/api/Score";
import ScoreCard from "./ScoreCard";

interface ScoresSectionProps {
    isLoading: boolean;
    scores: UserScore[];
}

export const ScoresSection = ({ isLoading, scores }: ScoresSectionProps) => {
    if (isLoading) {
        return (
            <div className="w-full max-w-4xl">
                <Skeleton className="h-72 w-full" />
            </div>
        );
    }

    if (scores.length === 0) {
        return (
            <Card className="w-full max-w-4xl p-5 shadow-xl transition-all duration-300 hover:shadow-2xl">
                <CardContent className="flex items-center justify-center py-10">
                    <p className="text-gray-500">No scores available yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-4xl">
            <ScoreCard scores={scores} />
        </div>
    );
}; 