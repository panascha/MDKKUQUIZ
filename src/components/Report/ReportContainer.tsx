"use client";

import React, { useState, useMemo } from 'react';
import { useGetReport } from '../../hooks/report/useGetReport';
import ReportCard from './ReportCard';
import { LoaderIcon, Search, Filter } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/DropdownMenu';
import { Report } from '../../types/api/Report';

export default function ReportContainer() {
    const { data: reports = [], isLoading, error } = useGetReport();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'quiz' | 'keyword'>('all');

    // Filter & Sort Logic
    const filteredReports = useMemo(() => {
        // 1. Sort by Date (Newest first)
        const sortedReports = [...reports].sort((a: Report, b: Report) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return sortedReports.filter((report: Report) => {
            // 2. Filter by Status
            if (statusFilter !== 'all' && report.status !== statusFilter) return false;

            // 3. Filter by Type
            if (typeFilter !== 'all' && report.type !== typeFilter) return false;

            // 4. Filter by Search Term
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                
                // Check Reason
                if (report.reason?.toLowerCase().includes(term)) return true;
                
                if (report.type === 'quiz') {
                    // Helper to check array of strings (for choices/answers)
                    const hasTerm = (arr?: string[]) => arr?.some(item => item.toLowerCase().includes(term));

                    // Check Question (Original & Suggested)
                    if (report.originalQuiz?.question.toLowerCase().includes(term)) return true;
                    if (report.suggestedChanges?.question.toLowerCase().includes(term)) return true;

                    // Check Choices (Original & Suggested)
                    if (hasTerm(report.originalQuiz?.choice)) return true;
                    if (hasTerm(report.suggestedChanges?.choice)) return true;

                    // Check Correct Answer (Original & Suggested)
                    if (hasTerm(report.originalQuiz?.correctAnswer)) return true;
                    if (hasTerm(report.suggestedChanges?.correctAnswer)) return true;

                } else {
                    // Check Keyword Name
                    if (report.originalKeyword?.name.toLowerCase().includes(term)) return true;
                    if (report.suggestedChangesKeyword?.name.toLowerCase().includes(term)) return true;
                    
                    // Check Keywords tags
                    if (report.originalKeyword?.keywords.some(k => k.toLowerCase().includes(term))) return true;
                    if (report.suggestedChangesKeyword?.keywords.some(k => k.toLowerCase().includes(term))) return true;
                }

                return false;
            }

            return true;
        });
    }, [reports, statusFilter, typeFilter, searchTerm]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500 gap-3">
                <LoaderIcon className="animate-spin w-8 h-8 text-blue-500" />
                <p>Loading reports...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-red-500">
                Error loading reports. Please try again later.
            </div>
        );
    }

    // Common style for dropdown items
    const dropdownItemClass = "cursor-pointer hover:bg-gray-100 transition-colors duration-200";

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl mt-16">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Status</h1>
                <p className="text-gray-500">Track and manage content reports</p>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 sticky top-20 z-10">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    
                    {/* Search Bar */}
                    <div className="relative w-full md:w-1/2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search in question, choice, answer or reason..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 w-full md:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors text-sm font-medium text-gray-700 w-1/2 md:w-auto justify-center cursor-pointer">
                                <Filter className="w-4 h-4" />
                                <span>Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem className={dropdownItemClass} onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
                                <DropdownMenuItem className={dropdownItemClass} onClick={() => setStatusFilter('pending')}>Pending</DropdownMenuItem>
                                <DropdownMenuItem className={dropdownItemClass} onClick={() => setStatusFilter('approved')}>Approved</DropdownMenuItem>
                                <DropdownMenuItem className={dropdownItemClass} onClick={() => setStatusFilter('rejected')}>Rejected</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors text-sm font-medium text-gray-700 w-1/2 md:w-auto justify-center cursor-pointer">
                                <Filter className="w-4 h-4" />
                                <span>Type: {typeFilter === 'all' ? 'All' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem className={dropdownItemClass} onClick={() => setTypeFilter('all')}>All Types</DropdownMenuItem>
                                <DropdownMenuItem className={dropdownItemClass} onClick={() => setTypeFilter('quiz')}>Quiz</DropdownMenuItem>
                                <DropdownMenuItem className={dropdownItemClass} onClick={() => setTypeFilter('keyword')}>Keyword</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Report List */}
            <div className="space-y-4">
                {filteredReports.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 text-lg">No reports found.</p>
                    </div>
                ) : (
                    filteredReports.map((report: Report) => (
                        <ReportCard key={report._id} report={report} />
                    ))
                )}
            </div>
            
            <div className="mt-4 text-right text-sm text-gray-400">
                Total: {filteredReports.length}
            </div>
        </div>
    );
}