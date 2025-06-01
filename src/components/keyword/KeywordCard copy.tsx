import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Keyword } from "@/types/api/Keyword";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { useParams } from 'next/navigation';

interface KeywordCardProps {
    keywords: Keyword[];
}

const KeywordCard: React.FC<KeywordCardProps> = ({ keywords }) => {
    const { subjectID } = useParams();

    return (
        <Card className="w-full shadow-xl transition-all duration-300 max-w-5xl">
            <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {keywords.map((keyword) => (
                <Link
                    href={`/home/${subjectID}/keyword/${keyword._id}`}
                    key={keyword._id}
                    className="block transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded-lg"
                >
                    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="space-y-2">
                                    <p className="text-sm font-semibold text-gray-700">
                            {/* แก้ เป็น keyword.name */}
                            {keyword.name}
                        </p>
                        <p className="text-sm text-gray-500">
                            {keyword.subject.name}
                        </p>
                        </div>
                        <Badge
                        className={`transition-colors duration-300 ${
                            keyword.approved
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                        >
                        {keyword.approved ? "Approved" : "Pending"}
                        </Badge>
                    </div>
                            <div className="mt-4 space-y-1 text-sm text-gray-600">
                                {/* แก้ เป็น keyword.keyword */}
                        <p className="font-medium">Keywords: {keyword.keyword.slice(0, 3).join(", ").substring(0, 20)}{keyword.keyword.join(", ").length > 20 ? "..." : ""}</p>
                    </div>
                    </div>
                </Link>
                ))}
            </div>
            </CardContent>
        </Card>
    );
};

export default KeywordCard;