"use client";

import React from 'react';
import type { Stat, UserStat } from '../../../types/api/Stat';
import type { Subject } from '../../../types/api/Subject';
import { LoaderIcon } from 'lucide-react';
import { ChartBarIcon, ClipboardDocumentListIcon, TagIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export interface UserStatDisplayProps {
  totalStat: Stat | null;
  stat: UserStat | null;
  subject: Subject | null;
  isLoading: boolean;
}

const UserStatDisplay: React.FC<UserStatDisplayProps> = ({ totalStat, stat, subject, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoaderIcon className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2 text-gray-600">Loading statistics...</span>
      </div>
    );
  }

  if (!stat) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="bg-gray-50 rounded-lg p-6">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">
            This user has no activity in {subject ? subject.name : 'any subject'}
          </p>
        </div>
      </div>
    );
  }

  const safePct = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">Quizzes</p>
              <p className="text-2xl font-bold text-blue-900">{stat.quizCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TagIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Keywords</p>
              <p className="text-2xl font-bold text-green-900">{stat.keywordCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">Reports</p>
              <p className="text-2xl font-bold text-red-900">{stat.reportCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-800">Total</p>
              <p className="text-2xl font-bold text-purple-900">{stat.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity Breakdown Chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Activity Breakdown</h3>
          <div className="space-y-3">
            {/* Quiz Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-blue-700">Quizzes</span>
                <span className="text-sm text-blue-600">{stat.quizCount} ({safePct(stat.quizCount, totalStat.totalQuizzes).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${safePct(stat.quizCount, totalStat.totalQuizzes)}%` }}
                ></div>
              </div>
            </div>

            {/* Keywords Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-green-700">Keywords</span>
                <span className="text-sm text-green-600">{stat.keywordCount} ({safePct(stat.keywordCount, totalStat.totalKeywords).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${safePct(stat.keywordCount, totalStat.totalKeywords)}%` }}
                ></div>
              </div>
            </div>

            {/* Reports Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-red-700">Reports</span>
                <span className="text-sm text-red-600">{stat.reportCount} ({safePct(stat.reportCount, totalStat.totalPendingReports).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-red-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${safePct(stat.reportCount, totalStat.totalPendingReports)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Performance Insights</h3>
          <div className="space-y-4">
            {/* Contribution Level */}
            <div>
              <label className="text-sm font-medium text-gray-600">Contribution Level</label>
              <div className="mt-1">
                {stat.total >= 20 ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                    🏆 High Contributor
                  </span>
                ) : stat.total >= 10 ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    📈 Active Contributor
                  </span>
                ) : stat.total >= 5 ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    🌱 Growing Contributor
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    🆕 New Contributor
                  </span>
                )}
              </div>
            </div>

            {/* Quiz Eligibility Status */}
            <div>
              <label className="text-sm font-medium text-gray-600">Quiz Eligibility</label>
              <div className="mt-1">
                {stat.quizCount >= 4 ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                    ✅ Eligible to Take Quizzes
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                    ⏳ Need {4 - stat.quizCount} more quiz(s)
                  </span>
                )}
              </div>
            </div>

            {/* Primary Activity */}
            <div>
              <label className="text-sm font-medium text-gray-600">Primary Activity</label>
              <div className="mt-1">
                {stat.total === 0 ? (
                  <span className="text-sm text-gray-700 font-medium">😴 Do Nothing</span>
                ) : stat.quizCount >= stat.keywordCount && stat.quizCount >= stat.reportCount ? (
                  <span className="text-sm text-blue-700 font-medium">📝 Quiz Creator</span>
                ) : stat.keywordCount >= stat.reportCount ? (
                  <span className="text-sm text-green-700 font-medium">🏷️ Keyword Contributor</span>
                ) : (
                  <span className="text-sm text-red-700 font-medium">🚨 Report Submitter</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatDisplay;
