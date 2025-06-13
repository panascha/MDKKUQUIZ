import React from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Report } from '@/types/api/Report';

interface ReportsTabProps {
    reports: Report[];
    onReview: (id: string) => void;
    onDismiss: (id: string) => void;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ reports, onReview, onDismiss }) => {
    if (reports.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <p className="text-gray-500 text-center text-sm sm:text-base">No pending reports to review</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {reports.map((report) => (
                <Card key={report._id} className="p-4 sm:p-6 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                {report.type === 'quiz' ? report.originalQuiz?.question : report.originalKeyword?.name}
                            </h3>
                            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-orange-100 text-orange-800">
                                Reported by: {report.User.name}
                            </span>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600">{report.reason}</p>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <Button
                                onClick={() => onReview(report._id)}
                                className="flex-1 sm:flex-none bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                textButton="Review"
                            />
                            <Button
                                onClick={() => onDismiss(report._id)}
                                className="flex-1 sm:flex-none bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                textButton="Dismiss"
                            />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default ReportsTab; 