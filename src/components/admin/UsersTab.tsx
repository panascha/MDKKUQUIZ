import React from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface UsersTabProps {
    users: User[];
    onEdit: (id: string) => void;
    onBan: (id: string) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ users, onEdit, onBan }) => {
    if (users.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <p className="text-gray-500 text-center text-sm sm:text-base">No users found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {users.map((user) => (
                <Card key={user.id} className="p-4 sm:p-6 bg-white shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="space-y-1 sm:space-y-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{user.name}</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                                    {user.email}
                                </span>
                                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                            <Button
                                onClick={() => onEdit(user.id)}
                                className="flex-1 sm:flex-none bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                textButton="Edit"
                            />
                            <Button
                                onClick={() => onBan(user.id)}
                                className="flex-1 sm:flex-none bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                textButton="Ban"
                            />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default UsersTab; 