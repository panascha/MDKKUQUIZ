"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useGetReport } from '@/hooks/report/useGetReport';
import { useUser } from '@/hooks/useUser';
import { Role_type } from '@/config/role';
import { Badge } from '@/components/ui/Badge';
import ProtectedPage from '@/components/ProtectPage';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { IoIosArrowBack } from 'react-icons/io';
import Link from 'next/link';
import { FrontendRoutes } from '@/config/apiRoutes';
import { Report } from '@/types/api/Report';
import ReportDetailDropdown from "./ReportDetailDropdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Trash2 } from 'lucide-react';
import { useDeleteReport } from '@/hooks/report/useDeleteReport';

const ReportContainer = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: reports = [], isLoading, error } = useGetReport();
  const { user } = useUser();
  const deleteReportMutation = useDeleteReport();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'status-az' | 'status-za'>('newest');

  const isAdmin = user?.role === Role_type.ADMIN || user?.role === Role_type.SADMIN;

  const filteredReports = useMemo(() => {
    let filtered = reports;
    if (!isAdmin && user?._id) {
      filtered = filtered.filter((r: any) => r.User?._id === user._id);
    }
    if (selectedStatus) {
      filtered = filtered.filter((r: any) => r.status === selectedStatus);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((r: any) =>
        (r.title && r.title.toLowerCase().includes(term)) ||
        (r.description && r.description.toLowerCase().includes(term))
      );
    }
    return filtered;
  }, [reports, user?._id, isAdmin, searchTerm, selectedStatus]);

  const sortedReports = useMemo(() => {
    let sorted = [...filteredReports];
    if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'status-az') {
      sorted.sort((a, b) => a.status.localeCompare(b.status));
    } else if (sortBy === 'status-za') {
      sorted.sort((a, b) => b.status.localeCompare(a.status));
    }
    return sorted;
  }, [filteredReports, sortBy]);

  const quizReports = sortedReports.filter((r: Report) => r.type === 'quiz');
  const keywordReports = sortedReports.filter((r: Report) => r.type === 'keyword');

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error.toString()}</div>;
  }

  return (
    <ProtectedPage>
      <div className="container mx-auto p-4 mt-20 flex flex-col items-center">
        <div className="absolute top-23 left-8 text-lg">
          <Link href={FrontendRoutes.HOMEPAGE}>
            <button className="flex items-center mb-4 hover:bg-orange-400 hover:text-white pr-2 py-2 rounded-sm transition duration-300 ease-in-out hover:opacity-80 cursor-pointer">
              <span className="flex items-center"><IoIosArrowBack className="text-xl" /> Back</span>
            </button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-center mb-4">Report List</h1>
        <div className="w-full max-w-5xl mb-4 flex justify-end">
          <select
            className="border border-gray-300 rounded-md p-2"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="status-az">Status (A-Z)</option>
            <option value="status-za">Status (Z-A)</option>
          </select>
        </div>
        <section className="flex flex-col gap-4 mt-3 mx-auto p-2 sm:p-4 md:p-6 w-full max-w-5xl items-center justify-center md:flex-row md:justify-between">
          <div className="flex flex-col gap-2 w-full md:w-7/12">
            <label htmlFor="search" className="text-sm md:text-md text-center md:text-left">Search:</label>
            <input
              id="search"
              type="text"
              placeholder="Search by title or description"
              className="border border-gray-300 rounded-md p-2 w-full"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-5/12 md:flex-row md:gap-4">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm md:text-md text-center md:text-left hidden md:block">Filter status:</label>
              <DropdownMenu>
                <DropdownMenuTrigger className="hover:bg-gray-200 border border-gray-300 rounded-md p-2 w-full transition duration-300 ease-in-out cursor-pointer">
                  {selectedStatus ? selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1) : "All Statuses"}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 sm:w-56 bg-white">
                  <DropdownMenuItem onClick={() => setSelectedStatus(null)} className="cursor-pointer hover:bg-gray-200">All Statuses</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus("approved")} className="cursor-pointer hover:bg-gray-200">Approved</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus("pending")} className="cursor-pointer hover:bg-gray-200">Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus("rejected")} className="cursor-pointer hover:bg-gray-200">Rejected</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>
        <div className="w-full max-w-5xl mb-4 text-right">
          <p className="text-gray-600">
            Total Reports: <span className="font-semibold">{filteredReports.length}</span>
          </p>
        </div>
        <Tabs defaultValue="quiz" className="w-full max-w-5xl">
          <TabsList className="bg-white p-1 rounded-lg shadow-sm overflow-x-auto flex whitespace-nowrap mb-4">
            <TabsTrigger value="quiz" className="data-[state=active]:bg-gray-100 text-sm sm:text-base">
              Quiz Reports
            </TabsTrigger>
            <TabsTrigger value="keyword" className="data-[state=active]:bg-gray-100 text-sm sm:text-base">
              Keyword Reports
            </TabsTrigger>
          </TabsList>
          <TabsContent value="quiz">
            <div className="grid gap-6">
              {quizReports.length === 0 ? (
                <div className="text-gray-500 text-center">No quiz reports found.</div>
              ) : (
                quizReports.map((report: Report) => (
                  <div
                    key={report._id}
                    className={`relative group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer ${openReportId === report._id ? 'bg-gray-50' : ''}`}
                    onClick={() => setOpenReportId(openReportId === report._id ? null : report._id)}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpenReportId(openReportId === report._id ? null : report._id); }}
                    role="button"
                    aria-expanded={openReportId === report._id}
                  >
                    {isAdmin && openReportId === report._id && (
                      <Badge
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 absolute top-4 right-4 z-10 ${
                          report.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : report.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                            : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                    )}
                    {user?.role === 'S-admin' && openReportId === report._id && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this report?')) {
                            deleteReportMutation.mutate(report._id);
                          }
                        }}
                        className="absolute top-4 right-28 z-10 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                        title="Delete report"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    <div className="items-center justify-between mb-4">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-700">Quiz Report</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{report.reason}</p>
                        <div className="flex justify-center w-full">
                          <ReportDetailDropdown report={report} open={openReportId === report._id} />
                        </div>
                      </div>
                      {isAdmin && openReportId !== report._id && (
                        <Badge
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                            report.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : report.status === "pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                              : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                          }`}
                        >
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="keyword">
            <div className="grid gap-6">
              {keywordReports.length === 0 ? (
                <div className="text-gray-500 text-center">No keyword reports found.</div>
              ) : (
                keywordReports.map((report: Report) => (
                  <div
                    key={report._id}
                    className={`relative group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer ${openReportId === report._id ? 'bg-gray-50' : ''}`}
                    onClick={() => setOpenReportId(openReportId === report._id ? null : report._id)}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpenReportId(openReportId === report._id ? null : report._id); }}
                    role="button"
                    aria-expanded={openReportId === report._id}
                  >
                    {isAdmin && openReportId === report._id && (
                      <Badge
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 absolute top-4 right-4 z-10 ${
                          report.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : report.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                            : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                    )}
                    {user?.role === 'S-admin' && openReportId === report._id && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this report?')) {
                            deleteReportMutation.mutate(report._id);
                          }
                        }}
                        className="absolute top-4 right-28 z-10 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                        title="Delete report"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    <div className="items-center justify-between mb-4">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-700">Keyword Report</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{report.reason}</p>
                        <div className="flex justify-center w-full">
                          <ReportDetailDropdown report={report} open={openReportId === report._id} />
                        </div>
                      </div>
                      {isAdmin && openReportId !== report._id && (
                        <Badge
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                            report.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : report.status === "pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                              : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                          }`}
                        >
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedPage>
  );
};

export default ReportContainer;
