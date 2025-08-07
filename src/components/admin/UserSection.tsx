import React, { useState } from 'react';
import { useGetAllUser } from '../../hooks/User/useGetAllUser';
import { BackendRoutes } from '../../config/apiRoutes';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useUser } from '../../hooks/User/useUser';
import BanUserModal from './BanUserModal';
import { Role_type } from '../../config/role';

const roles = ['user', 'admin', 'S-admin'];

export default function UserSection() {
  const { data: users, isLoading, error, refetch } = useGetAllUser();
  const { data: session } = useSession();
  const { user: currentUser } = useUser();
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [banModalUser, setBanModalUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'banned' | 'unbanned'>('all');

  if (currentUser?.role !== 'S-admin') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mt-8 text-center text-lg text-gray-500">
        Only <span className="font-bold text-blue-700">Super Admin</span> can access this section.
      </div>
    );
  }

  const handleEdit = (user: any) => {
    setEditUserId(user._id);
    setEditForm({ year: user.year, role: user.role });
    setSaveError(null);
  };

  const handleCancel = () => {
    setEditUserId(null);
    setEditForm({});
    setSaveError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(editUserId);
    setSaveError(null);
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          await fetch(`${BackendRoutes.UPDATE_USER}/${editUserId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.user.token}`,
            },
            body: JSON.stringify(editForm),
          });
          setEditUserId(null);
          setEditForm({});
          refetch();
          resolve('User updated successfully!');
        } catch (err: any) {
          setSaveError(err?.message || 'Failed to update user');
          reject(err);
        } finally {
          setSaving(null);
        }
      }),
      {
        loading: 'Updating user...',
        success: 'User updated successfully!',
        error: 'Failed to update user',
      }
    );
  };

  const openBanModal = (user: any) => {
    setBanModalUser(user);
  };

  const closeBanModal = () => {
    setBanModalUser(null);
  };

  const handleUnban = async (user: any) => {
    try {
      await fetch(`${BackendRoutes.UNBAN_USER}/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user.token}`,
        },
      });
      refetch();
      toast.success('User unbanned successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to unban user');
    }
  };

  if (isLoading) return <div className="py-10 text-center text-lg">Loading users...</div>;
  if (error) return <div className="py-10 text-center text-red-500">Error: {error.message}</div>;

  // Filter users based on active tab
  const filteredUsers = users?.filter((user: any) => {
    if (activeTab === 'banned') return user.status?.isBanned;
    if (activeTab === 'unbanned') return !user.status?.isBanned;
    return true; // 'all' tab shows everyone
  }) || [];

  const bannedCount = users?.filter((user: any) => user.status?.isBanned).length || 0;
  const unbannedCount = users?.filter((user: any) => !user.status?.isBanned).length || 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center sm:text-left">User Management</h2>
      
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Users ({users?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('unbanned')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'unbanned'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Active Users ({unbannedCount})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('banned')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'banned'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Banned Users ({bannedCount})
            </span>
          </button>
        </nav>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">Total Users</p>
              <p className="text-2xl font-bold text-blue-900">{users?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Active Users</p>
              <p className="text-2xl font-bold text-green-900">{unbannedCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">Banned Users</p>
              <p className="text-2xl font-bold text-red-900">{bannedCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg text-sm sm:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-2 sm:px-4 text-left whitespace-nowrap">Name</th>
              <th className="py-2 px-2 sm:px-4 text-left whitespace-nowrap">Email</th>
              <th className="py-2 px-2 sm:px-4 text-left whitespace-nowrap">Role</th>
              <th className="py-2 px-2 sm:px-4 text-left whitespace-nowrap">Year</th>
              <th className="py-2 px-2 sm:px-4 text-left whitespace-nowrap">Actions</th>
              <th className="py-2 px-2 sm:px-4 text-left whitespace-nowrap">Ban</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  {activeTab === 'banned' ? (
                    <div className="flex flex-col items-center">
                      <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-lg font-medium">No banned users</span>
                      <span className="text-sm text-gray-400">All users are currently active</span>
                    </div>
                  ) : activeTab === 'unbanned' ? (
                    <div className="flex flex-col items-center">
                      <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <span className="text-lg font-medium">No active users</span>
                      <span className="text-sm text-gray-400">All users are currently banned</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <span className="text-lg font-medium">No users found</span>
                      <span className="text-sm text-gray-400">There are no users in the system</span>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user: any) => {
              console.log('user._id:', user._id, 'currentUser._id:', currentUser?._id, 'equal:', user._id === currentUser?._id);
              return (
                <tr key={user._id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-2 sm:px-4 max-w-[120px] truncate">{user.name}</td>
                <td className="py-2 px-2 sm:px-4 max-w-[160px] truncate">{user.email}</td>
                <td className="py-2 px-2 sm:px-4">
                  {editUserId === user._id ? (
                    <select
                      name="role"
                      value={editForm.role || ''}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td className="py-2 px-2 sm:px-4">
                  {editUserId === user._id ? (
                    <input
                      name="year"
                      value={editForm.year || ''}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full"
                      type="number"
                      min={1}
                      max={6}
                    />
                  ) : (
                    user.year
                  )}
                </td>
                <td className="py-2 px-2 sm:px-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  {editUserId === user._id ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60 w-full sm:w-auto"
                        disabled={saving === user._id}
                      >
                        {saving === user._id ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 w-full sm:w-auto"
                        disabled={saving === user._id}
                      >
                        Cancel
                      </button>
                      {saveError && <div className="text-xs text-red-500 mt-1">{saveError}</div>}
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(user)}
                      className="px-3 py-1 bg-yellow-400 text-gray-800 rounded hover:bg-yellow-500 w-full sm:w-auto"
                    >
                      Edit
                    </button>
                  )}
                </td>
                <td className="py-2 px-2 sm:px-4">
                  {user.status?.isBanned ? (
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-700 font-semibold text-sm">Banned</span>
                      </div>
                      <button
                        onClick={() => handleUnban(user)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-auto text-sm font-medium"
                        disabled={user._id === currentUser?._id}
                        title={user._id === currentUser?._id ? 'You cannot unban yourself.' : 'Click to unban this user'}
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                          Unban
                        </span>
                      </button>
                    </div>
                  ) : (
                    user._id !== currentUser?._id && user.role !== Role_type.SADMIN && (
                      <button
                        onClick={() => openBanModal(user)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg w-full sm:w-auto text-sm font-medium"
                        title="Click to ban this user"
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                          </svg>
                          Ban User
                        </span>
                      </button>
                    )
                  )}
                </td>
              </tr>
              );
            })
            )}
          </tbody>
        </table>
      </div>
      <BanUserModal
        open={!!banModalUser}
        onOpenChange={open => { if (!open) closeBanModal(); }}
        user={banModalUser}
        session={session}
        refetch={refetch}
        onCancel={closeBanModal}
      />
    </div>
  );
}
