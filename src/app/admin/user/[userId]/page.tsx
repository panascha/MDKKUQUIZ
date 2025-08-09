"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { BACKEND_URL } from '../../../../config/apiRoutes';
import { useGetUserStatById } from '../../../../hooks/stats/useGetUserStatById';
import { useGetSubject } from '../../../../hooks/subject/useGetSubject';
import { Subject } from '../../../../types/api/Subject';
import { UserStat } from '../../../../types/api/Stat';
import { useUser } from '../../../../hooks/User/useUser';
import { Role_type } from '../../../../config/role';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../../components/ui/DropdownMenu';
import { ArrowLeftIcon, UserIcon, EnvelopeIcon, CalendarIcon, ShieldCheckIcon, ChartBarIcon, ClipboardDocumentListIcon, TagIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { LoaderIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface UserStatDisplayProps {
  stat: UserStat | null;
  subject: Subject | null;
  isLoading: boolean;
}

const UserStatDisplay: React.FC<UserStatDisplayProps> = ({ stat, subject, isLoading }) => {
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
                <span className="text-sm text-blue-600">{stat.quizCount} ({((stat.quizCount / stat.total) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(stat.quizCount / stat.total) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Keywords Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-green-700">Keywords</span>
                <span className="text-sm text-green-600">{stat.keywordCount} ({((stat.keywordCount / stat.total) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(stat.keywordCount / stat.total) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Reports Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-red-700">Reports</span>
                <span className="text-sm text-red-600">{stat.reportCount} ({((stat.reportCount / stat.total) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-red-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(stat.reportCount / stat.total) * 100}%` }}
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

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { user: currentUser } = useUser();
  const userId = typeof params.userId === 'string' ? params.userId : '';
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  // Check permissions
  if (currentUser?.role !== Role_type.SADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <ShieldCheckIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            Only <span className="font-bold text-blue-700">Super Admin</span> can access user details.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Fetch subjects using React Query with the existing useGetSubject function
  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: useGetSubject,
    enabled: !!session?.user.token,
  });

  // Set default subject when subjects are loaded
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject('all'); // Default to "All Subjects"
    }
  }, [subjects, selectedSubject]);

  // Fetch user stats for selected subject - this also includes user details
  const { data: userStat, isLoading: isLoadingStats, error: statsError } = useGetUserStatById(
    userId,
    selectedSubject === 'all' ? undefined : selectedSubject, // Pass undefined for "All Subjects"
    !!userId && !!selectedSubject
  );

  const selectedSubjectObj = subjects.find(s => s._id === selectedSubject);
  const user = userStat?.user; // Get user data from the stat response

  // Get user status for display - now with full user data
  const getUserStatus = () => {
    if (!user) return null;
    
    if (user.status?.isBanned) {
      return {
        label: 'Banned',
        className: 'bg-red-100 text-red-800 border border-red-200',
        icon: <ExclamationTriangleIcon className="h-4 w-4" />
      };
    }
    
    return {
      label: 'Active',
      className: 'bg-green-100 text-green-800 border border-green-200',
      icon: <ShieldCheckIcon className="h-4 w-4" />
    };
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'S-admin':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (isLoadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoaderIcon className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (statsError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
          <p className="text-gray-600 mb-4">
            The requested user could not be found or you don't have permission to view their details.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const status = getUserStatus();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to User Management
          </button>
        </div>

        {/* User Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">User Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-lg text-gray-900">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <p className="text-lg text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 pr-3">Role</label>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                        <ShieldCheckIcon className="h-4 w-4 mr-1" />
                        {user.role}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Academic Year</label>
                  <p className="text-lg text-gray-900">Year {user.year}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Status</label>
                  <div className="flex items-center space-x-2">
                    {user.status?.isBanned ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                        <ShieldCheckIcon className="h-4 w-4 mr-1" />
                        Active
                      </span>
                    )}
                  </div>
                </div>
                {user.status?.isBanned && user.status.banReason && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ban Reason</label>
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                      {user.status.banReason}
                    </p>
                  </div>
                )}
                {user.status?.isBanned && user.status.banUntil && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ban Until</label>
                    <p className="text-sm text-red-600">
                      {new Date(user.status.banUntil).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">User Statistics</h2>
                
                {/* Subject Filter */}
                <div className="mt-4 sm:mt-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Subject
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="min-w-[200px] text-left hover:bg-gray-200 border border-gray-300 rounded-md p-2 transition duration-300 ease-in-out cursor-pointer">
                      {isLoadingSubjects ? (
                        <span className="flex items-center">
                          <LoaderIcon className="animate-spin h-4 w-4 mr-2" />
                          Loading...
                        </span>
                      ) : selectedSubject === 'all' ? (
                        <div className="flex items-center">
                          <ChartBarIcon className="h-5 w-5 mr-2 text-gray-600" />
                          <span>All Subjects</span>
                        </div>
                      ) : selectedSubjectObj ? (
                        <div className="flex items-center">
                          {selectedSubjectObj.img && (
                            <div className="relative w-6 h-6 mr-2">
                              <Image
                                src={`${BACKEND_URL}${selectedSubjectObj.img}`}
                                alt={selectedSubjectObj.name}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          )}
                          <span>{selectedSubjectObj.name}</span>
                        </div>
                      ) : (
                        'Select Subject'
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 bg-white max-h-60 overflow-y-auto">
                      {/* All Subjects Option */}
                      <DropdownMenuItem
                        className="cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
                        onClick={() => setSelectedSubject('all')}
                      >
                        <div className="flex items-center">
                          <ChartBarIcon className="h-5 w-5 mr-3 text-gray-600" />
                          <div>
                            <div className="font-medium">All Subjects</div>
                            <div className="text-sm text-gray-500">Combined statistics</div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                      
                      {/* Individual Subjects */}
                      {subjects.map((subject) => (
                        <DropdownMenuItem
                          key={subject._id}
                          className="cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
                          onClick={() => setSelectedSubject(subject._id)}
                        >
                          <div className="flex items-center">
                            {subject.img && (
                              <div className="relative w-6 h-6 mr-3">
                                <Image
                                  src={`${BACKEND_URL}${subject.img}`}
                                  alt={subject.name}
                                  fill
                                  className="object-cover rounded"
                                />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{subject.name}</div>
                              <div className="text-sm text-gray-500">Year {subject.year}</div>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Stats Display */}
              <UserStatDisplay 
                stat={userStat || null} 
                subject={selectedSubjectObj || null} 
                isLoading={isLoadingStats} 
              />

              {/* Additional Info */}
              {userStat && (
                <div className="mt-6 space-y-4">
                  {/* Activity Summary */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      📊 Activity Summary {selectedSubject === 'all' ? 'Across All Subjects' : `for ${selectedSubjectObj?.name}`}
                    </h3>
                    <p className="text-blue-800">
                      This user has contributed <strong>{userStat.total}</strong> items in total
                      {selectedSubject === 'all' ? ' across all subjects' : ` for ${selectedSubjectObj?.name}`}, 
                      including <strong>{userStat.quizCount}</strong> quizzes, <strong>{userStat.keywordCount}</strong> keywords, 
                      and submitted <strong>{userStat.reportCount}</strong> reports.
                    </p>
                  </div>
                  
                  {/* Quiz Eligibility - Only show for specific subjects */}
                  {selectedSubject !== 'all' && selectedSubjectObj && (
                    <>
                      {userStat.quizCount < 4 ? (
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-start">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <h4 className="text-sm font-semibold text-yellow-800">Quiz Eligibility Status</h4>
                              <p className="text-yellow-700 text-sm mt-1">
                                User needs <strong>{4 - userStat.quizCount}</strong> more quiz contribution(s) 
                                to be eligible for taking quizzes in {selectedSubjectObj.name}.
                              </p>
                              <div className="mt-2">
                                <div className="w-full bg-yellow-200 rounded-full h-2">
                                  <div 
                                    className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${(userStat.quizCount / 4) * 100}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-yellow-600 mt-1">
                                  Progress: {userStat.quizCount}/4 quizzes ({((userStat.quizCount / 4) * 100).toFixed(0)}%)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center">
                            <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-3" />
                            <div>
                              <h4 className="text-sm font-semibold text-green-800">Quiz Eligible ✅</h4>
                              <p className="text-green-700 text-sm">
                                User is eligible to take quizzes in {selectedSubjectObj.name} with <strong>{userStat.quizCount}</strong> quiz contributions.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Overall Performance for All Subjects */}
                  {selectedSubject === 'all' && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="text-sm font-semibold text-purple-800 mb-2">🌟 Overall Performance</h4>
                      <div className="space-y-2 text-sm text-purple-700">
                        <p>
                          • Total contributions across all subjects: <strong>{userStat.total}</strong> items
                        </p>
                        <p>
                          • Quiz creation activity: <strong>{userStat.quizCount}</strong> questions created
                        </p>
                        <p>
                          • Content enhancement: <strong>{userStat.keywordCount}</strong> keywords added
                        </p>
                        <p>
                          • Quality assurance: <strong>{userStat.reportCount}</strong> reports submitted
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Contribution Insights */}
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h4 className="text-sm font-semibold text-indigo-800 mb-2">💡 Contribution Insights</h4>
                    <div className="space-y-2 text-sm text-indigo-700">
                      {userStat.quizCount > 0 && (
                        <p>• Created <strong>{userStat.quizCount}</strong> quiz question(s) helping other students learn</p>
                      )}
                      {userStat.keywordCount > 0 && (
                        <p>• Contributed <strong>{userStat.keywordCount}</strong> keyword(s) for better searchability</p>
                      )}
                      {userStat.reportCount > 0 && (
                        <p>• Submitted <strong>{userStat.reportCount}</strong> report(s) to improve content quality</p>
                      )}
                      {userStat.total === 0 && (
                        <p className="text-gray-600">
                          • No contributions yet {selectedSubject === 'all' ? 'in any subject' : `in ${selectedSubjectObj?.name}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
