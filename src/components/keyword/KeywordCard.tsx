import React from 'react';
import { Card, CardContent } from "../ui/Card";
import { Keyword } from "../../types/api/Keyword";
import { Badge } from "../ui/Badge";
import Link from "next/link";

interface KeywordCardProps {
    keywords: Keyword[];
}

const KeywordCard: React.FC<KeywordCardProps> = ({ keywords }) => {
    return (
        <Card className="w-full shadow-xl transition-all duration-300 max-w-5xl">
            <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {keywords.map((keyword) => (
                        <Link
                            href={`/keyword/${keyword._id}`}
                            key={keyword._id}
                            className="block transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded-lg"
                        >
                            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-gray-700">
                                            {keyword.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {keyword.subject.name}
                                        </p>
                                    </div>
                                    <Badge
                                        className={`transition-colors duration-300 ${
                                            keyword.status === "approved"
                                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                                            : keyword.status === "pending"
                                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                            : "bg-red-100 text-red-800 hover:bg-red-200"
                                        }`}
                                    >
                                        {keyword.status === "approved" 
                                            ? "Approved" 
                                            : keyword.status === "pending"
                                            ? "Pending"
                                            : "Rejected"}
                                    </Badge>
                                </div>
                                <div className="mt-4 space-y-1 text-sm text-gray-600">
                                    <p className="font-medium">Keywords: {keyword.keywords && keyword.keywords.length > 0 
                                        ? `${keyword.keywords.slice(0, 3).join(", ").substring(0, 20)}${keyword.keywords.join(", ").length > 20 ? "..." : ""}`
                                        : "No keywords"}</p>
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
