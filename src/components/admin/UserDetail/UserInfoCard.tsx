"use client";

import React from 'react';
import type { User } from '../../../types/User';
import { ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
  user: User;
}

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

const UserInfoCard: React.FC<Props> = ({ user }) => {
  return (
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
  );
};

export default UserInfoCard;
