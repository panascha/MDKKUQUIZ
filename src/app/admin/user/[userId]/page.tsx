"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { useGetUserStatById } from '../../../../hooks/stats/useGetUserStatById';
import { useGetSubject } from '../../../../hooks/subject/useGetSubject';
import { Subject } from '../../../../types/api/Subject';
import { useUser } from '../../../../hooks/User/useUser';
import { Role_type } from '../../../../config/role';
import { ArrowLeftIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { LoaderIcon } from 'lucide-react';
import UserStatDisplay from '../../../../components/admin/UserDetail/UserStatDisplay';
import UserInfoCard from '../../../../components/admin/UserDetail/UserInfoCard';
import SubjectFilter from '../../../../components/admin/UserDetail/SubjectFilter';
import UserAdditionalInfo from '../../../../components/admin/UserDetail/UserAdditionalInfo';
import { useGetStatOverAll } from '../../../../hooks/stats/useGetStatOverAll';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { user: currentUser } = useUser();
  const userId = typeof params.userId === 'string' ? params.userId : '';
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const { data: stats, isLoading: isStatsLoading } = useGetStatOverAll();
  
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

  if (isLoadingStats || isStatsLoading) {
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
            <UserInfoCard user={user} />
          </div>

          {/* Statistics Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">User Statistics</h2>
                
                {/* Subject Filter */}
                <SubjectFilter
                  subjects={subjects}
                  selectedSubject={selectedSubject}
                  isLoading={isLoadingSubjects}
                  onChange={setSelectedSubject}
                />
              </div>

              {/* Stats Display */}
              <UserStatDisplay
                totalStat={stats || null}
                stat={userStat || null}
                subject={selectedSubjectObj || null}
                isLoading={isLoadingStats}
              />

              {/* Additional Info */}
              {userStat && (
                <UserAdditionalInfo
                  userStat={userStat}
                  selectedSubject={selectedSubject}
                  selectedSubjectObj={selectedSubjectObj || null}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
