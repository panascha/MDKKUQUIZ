"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedPage from '@/components/ProtectPage';
import { Badge } from '@/components/ui/Badge';
import { Role_type } from '@/config/role';
import { useUser } from '@/hooks/useUser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { 
    FileText, 
    AlertTriangle, 
    BarChart3,
    LoaderIcon
} from 'lucide-react';
import { useGetStatOverAll } from '@/hooks/useGetStatOverAll';

// Import components
import StatsOverview from '@/components/admin/StatsOverview';
import KeywordsTab from '@/components/admin/KeywordsTab';
import QuizzesTab from '@/components/admin/QuizzesTab';
import ReportsTab from '@/components/admin/ReportsTab';
import { useRouter } from 'next/navigation';
import { FrontendRoutes } from '@/config/apiRoutes';
import { useGetQuizzesOnlyPending } from '@/hooks/quiz/useGetQuizzesOnlyPending';
import useApprovedReport from '@/hooks/Approved/useApprovedReport';
import useApprovedQuiz from '@/hooks/Approved/useApprovedQuiz';
import useApprovedKeyword from '@/hooks/Approved/useApprovedKeyword';
import { toast } from 'react-hot-toast';
import { useGetKeyword } from '@/hooks/keyword/useGetKeyword';
import { useGetReport } from '@/hooks/report/useGetReport';

const AdminPanel = () => {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();

    const { data: stats, isLoading: isStatsLoading } = useGetStatOverAll();
    const { data: keywords = [], isLoading: isKeywordsLoading } = useGetKeyword({ status: 'pending' });
    const { data: quiz = [], isLoading: isQuizLoading } = useGetQuizzesOnlyPending();
    const { data: reports = [], isLoading: isReportsLoading } = useGetReport({ status: 'pending' });
    const { mutate: approveReport } = useApprovedReport();
    const { mutate: approveQuiz } = useApprovedQuiz();
    const { mutate: approveKeyword } = useApprovedKeyword();

    const isAdmin = user?.role === Role_type.ADMIN || user?.role === Role_type.SADMIN;

    useEffect(() => {
        if (userLoading) return;
        if(!isAdmin) {
            router.push(FrontendRoutes.HOMEPAGE);
        }
    }, [router, user, isAdmin, userLoading]);

    // Handler functions
    const handleReportApprove = (id: string) => handleReportAction(id, true);
    const handleReportReject = (id: string) => handleReportAction(id, false);
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

    const handleReportAction = (id: string, isApproved: boolean) => {
        approveReport(
            { reportID: id, isApproved },
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

    return (
        <ProtectedPage>
            {userLoading || isStatsLoading || isKeywordsLoading || isQuizLoading || isReportsLoading? (
                <div className="min-h-screen flex items-center justify-center">
                    <LoaderIcon className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="min-h-screen pt-12 sm:pt-16 bg-gray-50">
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
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                        {/* Tabs */}
                        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
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
                            </TabsList>

                            {/* Tab Contents */}
                            <div className="mt-4 sm:mt-6">
                                <TabsContent value="overview">
                                    <StatsOverview stat={stats}/>
                                </TabsContent>
                                <TabsContent value="keywords">
                                    <KeywordsTab 
                                        keywords={keywords}
                                        onApprove={handleKeywordApprove}
                                        onReject={handleKeywordReject}
                                    />
                                </TabsContent>

                                <TabsContent value="quizzes">
                                    <QuizzesTab 
                                        quizzes={quiz}
                                        onApprove={handleQuizApprove}
                                        onReject={handleQuizReject}
                                    />
                                </TabsContent>

                                <TabsContent value="reports">
                                    <ReportsTab 
                                        reports={reports}
                                        onReview={handleReportApprove}
                                        onDismiss={handleReportReject}
                                    />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>
            )}
        </ProtectedPage>
    );
};

export default AdminPanel;
