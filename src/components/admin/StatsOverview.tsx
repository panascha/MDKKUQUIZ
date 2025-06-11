import React from 'react';
import { Card } from '@/components/ui/Card';
import { 
    FileText, 
    Clock, 
    AlertTriangle, 
    Users, 
    BookOpen, 
    MessageSquare,
    CheckCircle2,
    FileCheck
} from 'lucide-react';
import { StatsOverviewProps } from '@/hooks/useGetStatOverAll';

const StatsOverview: React.FC<StatsOverviewProps> = ({ 
    stat
}) => {
    // Check if all pending items are zero
    const hasNoPendingKeywords = stat?.totalPendingKeywords === 0;
    const hasNoPendingQuizzes = stat?.totalPendingQuizzes === 0;
    const hasNoPendingReports = stat?.totalPendingReports === 0;

    return (
        <div className="space-y-6">
            {/* Total Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Keywords</p>
                            <p className="text-2xl font-semibold text-gray-900">{stat?.totalKeywords || 0}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <FileText className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Quizzes</p>
                            <p className="text-2xl font-semibold text-gray-900">{stat?.totalQuizzes || 0}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <MessageSquare className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Reports</p>
                            <p className="text-2xl font-semibold text-gray-900">{stat?.totalReports || 0}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Pending Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Items</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending Keywords</p>
                            {hasNoPendingKeywords ? (
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <FileCheck className="w-5 h-5" />
                                    <p className="text-sm font-medium">All approved</p>
                                </div>
                            ) : (
                                <p className="text-xl font-semibold text-gray-900">{stat?.totalPendingKeywords || 0}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending Quizzes</p>
                            {hasNoPendingQuizzes ? (
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <FileCheck className="w-5 h-5" />
                                    <p className="text-sm font-medium">All approved</p>
                                </div>
                            ) : (
                                <p className="text-xl font-semibold text-gray-900">{stat?.totalPendingQuizzes || 0}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending Reports</p>
                            {hasNoPendingReports ? (
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <FileCheck className="w-5 h-5" />
                                    <p className="text-sm font-medium">All reviewed</p>
                                </div>
                            ) : (
                                <p className="text-xl font-semibold text-gray-900">{stat?.totalPendingReports || 0}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* User Statistics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h2>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="p-3 bg-emerald-50 rounded-lg">
                        <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Users</p>
                        <p className="text-xl font-semibold text-gray-900">{stat?.totalUsers || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsOverview; 