import React from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Keyword {
    id: string;
    name: string;
    subject: string;
    category: string;
}

interface KeywordsTabProps {
    keywords: Keyword[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

const KeywordsTab: React.FC<KeywordsTabProps> = ({ keywords, onApprove, onReject }) => {
    if (keywords.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <p className="text-gray-500 text-center text-sm sm:text-base">No pending keywords to review</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {keywords.map((keyword) => (
                <Card key={keyword.id} className="p-4 sm:p-6 bg-white shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="space-y-1 sm:space-y-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{keyword.name}</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                                    {keyword.subject}
                                </span>
                                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800">
                                    {keyword.category}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                            <Button
                                onClick={() => onApprove(keyword.id)}
                                className="flex-1 sm:flex-none bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                textButton="Approve"
                            />
                            <Button
                                onClick={() => onReject(keyword.id)}
                                className="flex-1 sm:flex-none bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                textButton="Reject"
                            />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default KeywordsTab; 