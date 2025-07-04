import React, { useState } from 'react';
import { useGetAllUser } from '@/hooks/useGetAllUser';
import { BackendRoutes } from '@/config/apiRoutes';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useUser } from '@/hooks/useUser';

const roles = ['user', 'admin', 'S-admin'];

export default function UserSection() {
  const { data: users, isLoading, error, refetch } = useGetAllUser();
  const { data: session } = useSession();
  const { user: currentUser } = useUser();
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  if (isLoading) return <div className="py-10 text-center text-lg">Loading users...</div>;
  if (error) return <div className="py-10 text-center text-red-500">Error: {error.message}</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Role</th>
              <th className="py-2 px-4 text-left">Year</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user: any) => (
              <tr key={user._id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-4">{user.name}</td>
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4">
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
                <td className="py-2 px-4">
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
                <td className="py-2 px-4 flex gap-2 items-center">
                  {editUserId === user._id ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                        disabled={saving === user._id}
                      >
                        {saving === user._id ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        disabled={saving === user._id}
                      >
                        Cancel
                      </button>
                      {saveError && <div className="text-xs text-red-500 mt-1">{saveError}</div>}
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(user)}
                      className="px-3 py-1 bg-yellow-400 text-gray-800 rounded hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
