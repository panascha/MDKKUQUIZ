'use client';
import React, { useState } from 'react';
import { Card } from '../ui/Card';
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
import { StatsOverviewProps } from '../../hooks/stats/useGetStatOverAll';
import { useGetDailyActivity } from '../../hooks/stats/useGetDailyActivity';

const StatsOverview: React.FC<StatsOverviewProps> = ({ 
    stat
}) => {
    const hasNoPendingKeywords = stat?.totalPendingKeywords === 0;
    const hasNoPendingQuizzes = stat?.totalPendingQuizzes === 0;
    const hasNoPendingReports = stat?.totalPendingReports === 0;

    // Daily Activity State
    const today = new Date().toISOString().slice(0, 10);
    const [selectedDate, setSelectedDate] = useState<string>(today);
    const { data: dailyActivity, isLoading: isDailyLoading, error: dailyError } = useGetDailyActivity(selectedDate);

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

            {/* Daily Activity Section */}
            <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl shadow-md p-8 mt-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Daily Activity
                </h2>
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <label className="font-medium text-gray-700">Select Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition w-full sm:w-auto"
                        max={today}
                    />
                </div>
                <div className="min-h-[60px]">
                {isDailyLoading ? (
                    <p className="text-gray-500 animate-pulse">Loading daily activity...</p>
                ) : dailyError ? (
                    <p className="text-red-500 font-medium">{dailyError.message}</p>
                ) : dailyActivity ? (
                    (dailyActivity.quiz.created === 0 && dailyActivity.quiz.updated === 0 &&
                     dailyActivity.keyword.created === 0 && dailyActivity.keyword.updated === 0 &&
                     dailyActivity.report.created === 0 && dailyActivity.report.updated === 0) ? (
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            No create or update activity on this day.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                            <table className="min-w-[340px] w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 border-b text-left font-semibold text-gray-700">Type</th>
                                        <th className="px-4 py-2 border-b text-left font-semibold text-gray-700">Created</th>
                                        <th className="px-4 py-2 border-b text-left font-semibold text-gray-700">Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-blue-50 transition">
                                        <td className="px-4 py-2 border-b font-medium text-blue-700">Quiz</td>
                                        <td className="px-4 py-2 border-b">
                                            <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold">
                                                {dailyActivity.quiz.created}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 border-b">
                                            <span className="inline-block px-2 py-1 rounded bg-emerald-100 text-emerald-700 font-semibold">
                                                {dailyActivity.quiz.updated}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-blue-50 transition">
                                        <td className="px-4 py-2 border-b font-medium text-amber-700">Keyword</td>
                                        <td className="px-4 py-2 border-b">
                                            <span className="inline-block px-2 py-1 rounded bg-amber-100 text-amber-700 font-semibold">
                                                {dailyActivity.keyword.created}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 border-b">
                                            <span className="inline-block px-2 py-1 rounded bg-emerald-100 text-emerald-700 font-semibold">
                                                {dailyActivity.keyword.updated}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-blue-50 transition">
                                        <td className="px-4 py-2 border-b font-medium text-orange-700">Report</td>
                                        <td className="px-4 py-2 border-b">
                                            <span className="inline-block px-2 py-1 rounded bg-orange-100 text-orange-700 font-semibold">
                                                {dailyActivity.report.created}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 border-b">
                                            <span className="inline-block px-2 py-1 rounded bg-emerald-100 text-emerald-700 font-semibold">
                                                {dailyActivity.report.updated}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    <p className="text-gray-400">No data for this date.</p>
                )}
                </div>
            </div>
        </div>
    );
};

export default StatsOverview; 