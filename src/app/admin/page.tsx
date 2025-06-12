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

const AdminPanel = () => {
    const { user, loading: userLoading } = useUser();
    const [stats, setStats] = useState<any>(null);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    const getStats = useGetStatOverAll();
    const {data:quiz, isLoading:isQuizLoading} = useGetQuizzesOnlyPending();

    const isAdmin = user?.role === Role_type.ADMIN || user?.role === Role_type.SADMIN;

    useEffect(() => {
        if (userLoading || isQuizLoading) {
            return;
        }
        if(!isAdmin) {
            router.push(FrontendRoutes.HOMEPAGE);
        }
        const fetchStats = async () => {
            try {
                const Statresponse = await getStats();
                setStats(Statresponse);
            } catch (error) {
                console.error('Error fetching stats:', error);
                setStats(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.token) {
            fetchStats();
        }
    }, [ router, user, isQuizLoading ]);

    // Mock data for each tab
    const mockKeywords = [
        { id: '1', name: 'Strongyloides stercoralis', subject: 'Medicine', category: 'Parasitology' }
    ];

    const mockQuizzes = [
        { id: '1', title: 'Parasitology Quiz #1', subject: 'Medicine', type: 'MCQ' }
    ];

    const mockReports = [
        { 
            id: '1', 
            title: 'Incorrect Information', 
            reporter: 'John Doe',
            description: 'The information about Strongyloides lifecycle is incorrect...',
            status: 'pending' as const
        }
    ];

    const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'User' }
    ];

    const mockSettings = [
        {
            id: '1',
            name: 'Auto-approve Keywords',
            description: 'Automatically approve keywords from trusted users',
            enabled: false
        },
        {
            id: '2',
            name: 'Email Notifications',
            description: 'Send email notifications for new reports',
            enabled: true
        }
    ];

    // Handler functions
    const handleKeywordApprove = (id: string) => {
        console.log('Approve keyword:', id);
    };

    const handleKeywordReject = (id: string) => {
        console.log('Reject keyword:', id);
    };

    const handleQuizApprove = (id: string) => {
        console.log('Approve quiz:', id);
    };

    const handleQuizReject = (id: string) => {
        console.log('Reject quiz:', id);
    };

    const handleReportReview = (id: string) => {
        console.log('Review report:', id);
    };

    const handleReportDismiss = (id: string) => {
        console.log('Dismiss report:', id);
    };

    const handleUserEdit = (id: string) => {
        console.log('Edit user:', id);
    };

    const handleUserBan = (id: string) => {
        console.log('Ban user:', id);
    };

    const handleSettingToggle = (id: string) => {
        console.log('Toggle setting:', id);
    };
       
    return (
        <ProtectedPage>
            {isLoading || userLoading ? (
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
                                        keywords={mockKeywords}
                                        onApprove={handleKeywordApprove}
                                        onReject={handleKeywordReject}
                                    />
                                </TabsContent>

                                <TabsContent value="quizzes">
                                    <QuizzesTab 
                                        quizzes={quiz || []}
                                        onApprove={handleQuizApprove}
                                        onReject={handleQuizReject}
                                    />
                                </TabsContent>

                                <TabsContent value="reports">
                                    <ReportsTab 
                                        reports={mockReports}
                                        onReview={handleReportReview}
                                        onDismiss={handleReportDismiss}
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
