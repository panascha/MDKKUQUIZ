import React from 'react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { User } from 'lucide-react';
import { Keyword } from '../../types/api/Keyword';

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
                <Card key={keyword._id} className="p-4 sm:p-6 bg-white shadow-sm">
                    <div className="flex flex-col gap-4">
                        {/* Header with name and status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{keyword.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <User className="w-4 h-4" />
                                    <span>Created by: {keyword.user?.name || 'Unknown'}</span>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                keyword.status === "approved"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : keyword.status === "pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : keyword.status === "reported"
                                ? "bg-orange-50 text-orange-700 border border-orange-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}>
                                {keyword.status.charAt(0).toUpperCase() + keyword.status.slice(1)}
                            </div>
                        </div>

                        {/* Subject and Category */}
                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {keyword.subject.name}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                {keyword.category.category}
                            </span>
                        </div>

                        {/* Keywords List */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Related Keywords:</p>
                            <div className="flex flex-wrap gap-2">
                                {keyword.keywords.map((kw, index) => (
                                    <span 
                                        key={index}
                                        className="px-2 py-1 bg-gray-100 rounded-md text-sm text-gray-700"
                                    >
                                        {kw}
                                </span>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {keyword.status === 'pending' && (
                            <div className="flex gap-2 sm:gap-3 mt-2">
                            <Button
                                    onClick={() => onApprove(keyword._id)}
                                className="flex-1 sm:flex-none bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                textButton="Approve"
                            />
                            <Button
                                    onClick={() => onReject(keyword._id)}
                                className="flex-1 sm:flex-none bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                textButton="Reject"
                            />
                        </div>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default KeywordsTab; 