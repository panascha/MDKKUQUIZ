"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedPage from '../../components/ProtectPage';
import { Badge } from '../../components/ui/Badge';
import { Role_type } from '../../config/role';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { 
    FileText, 
    AlertTriangle, 
    BarChart3,
    LoaderIcon
} from 'lucide-react';
import { useGetStatOverAll } from '../../hooks/stats/useGetStatOverAll';

import StatsOverview from '../../components/admin/StatsOverview';
import KeywordsTab from '../../components/admin/KeywordsTab';
import QuizzesTab from '../../components/admin/QuizzesTab';
import ReportsTab from '../../components/admin/ReportsTab';
import UserSection from '../../components/admin/UserSection';
import { useRouter } from 'next/navigation';
import { FrontendRoutes } from '../../config/apiRoutes';
import { useGetQuizzes } from "../../hooks/quiz/useGetQuizzes";
import useApprovedReport from '../../hooks/Approved/useApprovedReport';
import useApprovedQuiz from '../../hooks/Approved/useApprovedQuiz';
import useApprovedKeyword from '../../hooks/Approved/useApprovedKeyword';
import { toast } from 'react-hot-toast';
import { useGetKeyword } from '../../hooks/keyword/useGetKeyword';
import { useGetReport } from '../../hooks/report/useGetReport';
import { useUser } from '../../hooks/User/useUser';
import { YearFilter } from '../../components/subjects/YearFilter';
import { Quiz } from '../../types/api/Quiz';
import { Keyword } from '../../types/api/Keyword';
import { Report } from '../../types/api/Report';

export default function AdminPanel() {
    const { data: session, status } = useSession();
    const { user, loading: isUserLoading } = useUser();
    const { data: stats, isLoading: isStatsLoading } = useGetStatOverAll();
    const { data: keywords = [], isLoading: isKeywordsLoading } = useGetKeyword({ status: 'pending' });
    const { data: quizzes = [], isLoading: isQuizLoading } = useGetQuizzes({ status: 'pending' });
    const { data: reports = [], isLoading: isReportsLoading } = useGetReport({ status: 'pending' });
    const { mutate: approveReport } = useApprovedReport();
    const { mutate: approveQuiz } = useApprovedQuiz();
    const { mutate: approveKeyword } = useApprovedKeyword();
    const router = useRouter();

    // Check both session and user role
    const isAdmin = user?.role === "admin" || user?.role === "S-admin";

    // Add year filter state
    const defaultYear = user?.year ? Number(user.year) : null;
    const [selectedYear, setSelectedYear] = useState<number | null>(defaultYear);

    // Add active tab state
    const [activeTab, setActiveTab] = useState<string>('overview');

    useEffect(() => {
        if (status === "unauthenticated" || (!isUserLoading && !isAdmin)) {
            router.push(FrontendRoutes.HOMEPAGE);
        }
    }, [status, router, user?.role, isAdmin, user, isUserLoading]);
    
    const handleReportApprove = (id: string, reason: string) => handleReportAction(id, true, reason);
    const handleReportReject = (id: string, reason: string) => handleReportAction(id, false, reason);
    const handleKeywordApprove = (id: string) => handleKeywordAction(id, true);
    const handleKeywordReject = (id: string) => handleKeywordAction(id, false);
    const handleQuizApprove = (id: string) => handleQuizAction(id, true);
    const handleQuizReject = (id: string) => handleQuizAction(id, false);

    const handleKeywordAction = (id: string, isApproved: boolean) => {
        approveKeyword(
            { keywordID: id, isApproved },
            {
                onSuccess: () => {
                    toast.success(`Keyword has been ${isApproved ? 'approved' : 'rejected'}`);
                },
                onError: (error) => {
                    toast.error(`Failed to ${isApproved ? 'approve' : 'reject'} keyword`);
                    console.error(`Error ${isApproved ? 'approving' : 'rejecting'} keyword:`, error);
                }
            }
        );
    };

    const handleQuizAction = (id: string, isApproved: boolean) => {
        approveQuiz(
            { quizID: id, isApproved },
            {
                onSuccess: () => {
                    toast.success(`Quiz has been ${isApproved ? 'approved' : 'rejected'}`);
                },
                onError: (error) => {
                    toast.error(`Failed to ${isApproved ? 'approve' : 'reject'} quiz`);
                    console.error(`Error ${isApproved ? 'approving' : 'rejecting'} quiz:`, error);
                }
            }
        );
    };

    const handleReportAction = (id: string, isApproved: boolean, reason: string) => {
        approveReport(
            { reportID: id, isApproved, reason },
            {
                onSuccess: () => {
                    toast.success(`Report has been ${isApproved ? 'approved' : 'rejected'}`);
                },
                onError: (error) => {
                    toast.error(`Failed to ${isApproved ? 'approve' : 'reject'} report`);
                    console.error(`Error ${isApproved ? 'approving' : 'rejecting'} report:`, error);
                }
            }
        );
    };

    // Filter data by selected year
    const filteredQuizzes = selectedYear
        ? quizzes.filter((q: Quiz) => q.category?.subject?.year === selectedYear)
        : quizzes;
    const filteredKeywords = selectedYear
        ? keywords.filter((k: Keyword) => k.category?.subject?.year === selectedYear)
        : keywords;
    const filteredReports = selectedYear
        ? reports.filter((r: Report) => {
            if (r.originalQuiz && r.originalQuiz.subject?.year === selectedYear) return true;
            if (r.originalKeyword && r.originalKeyword.subject?.year === selectedYear) return true;
            return false;
        })
        : reports;

    if (status === "loading" || isStatsLoading || isKeywordsLoading || isQuizLoading || isReportsLoading || isUserLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoaderIcon className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (status === "unauthenticated" || !user || !isAdmin) {
        return null;
    }

    return (
        <ProtectedPage>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                            <div className="flex items-center gap-2 sm:gap-4">
                                <Badge className="px-2 sm:px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm">
                                {user?.role === Role_type.SADMIN ? 'Super Admin' : 'Admin'}
                                </Badge>
                            </div>
                        </div>
                        {/* Year Filter UI */}
                        <div className="mt-4">
                            <YearFilter selectedYear={selectedYear} onYearChange={setSelectedYear} />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="overview" className="space-y-4 sm:space-y-6">
                        <TabsList className="bg-white p-1 rounded-lg shadow-sm overflow-x-auto flex whitespace-nowrap">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100 text-sm sm:text-base">
                                <BarChart3 className="w-4 h-4 mr-1 sm:mr-2" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="quizzes" className="data-[state=active]:bg-gray-100 text-sm sm:text-base">
                                <FileText className="w-4 h-4 mr-1 sm:mr-2" />
                                Quizzes
                            </TabsTrigger>
                            <TabsTrigger value="keywords" className="data-[state=active]:bg-gray-100 text-sm sm:text-base">
                                <FileText className="w-4 h-4 mr-1 sm:mr-2" />
                                Keywords
                            </TabsTrigger>
                            <TabsTrigger value="reports" className="data-[state=active]:bg-gray-100 text-sm sm:text-base">
                                <AlertTriangle className="w-4 h-4 mr-1 sm:mr-2" />
                                Reports
                            </TabsTrigger>
                            {user?.role === 'S-admin' && (
                              <TabsTrigger value="users" className="data-[state=active]:bg-gray-100 text-sm sm:text-base">
                                  <BarChart3 className="w-4 h-4 mr-1 sm:mr-2" />
                                  Users
                              </TabsTrigger>
                            )}
                        </TabsList>

                        {/* Tab Contents */}
                        <div className="mt-4 sm:mt-6">
                            <TabsContent value="overview">
                                <StatsOverview stat={stats} onNavigateTab={setActiveTab}/>
                            </TabsContent>
                            <TabsContent value="keywords">
                                <KeywordsTab 
                                keywords={filteredKeywords}
                                    onApprove={handleKeywordApprove}
                                    onReject={handleKeywordReject}
                                />
                            </TabsContent>

                            <TabsContent value="quizzes">
                                <QuizzesTab 
                                quizzes={filteredQuizzes}
                                    onApprove={handleQuizApprove}
                                    onReject={handleQuizReject}
                                />
                            </TabsContent>

                            <TabsContent value="reports">
                                <ReportsTab 
                                reports={filteredReports}
                                    onReview={handleReportApprove}
                                    onDismiss={handleReportReject}
                                />
                            </TabsContent>

                            {user?.role === 'S-admin' && (
                              <TabsContent value="users">
                                  <UserSection />
                              </TabsContent>
                            )}
                        </div>
                    </Tabs>
                </div>
            </div>
        </ProtectedPage>
    );
}
