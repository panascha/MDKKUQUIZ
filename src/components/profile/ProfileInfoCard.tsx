import { Badge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Role_type } from "../../config/role";
import { User } from "../../types/User";
import { UserCircle2 } from "lucide-react";

interface ProfileInfoCardProps {
    user: User;
    isEditing: boolean;
    isUpdating: boolean;
    isLoggingOut: boolean;
    formData: Partial<User>;
    onEditToggle: () => void;
    onSave: () => void;
    onLogout: () => void;
    onFormDataChange: (data: Partial<User>) => void;
}

export const ProfileInfoCard = ({
    user,
    isEditing,
    isUpdating,
    isLoggingOut,
    formData,
    onEditToggle,
    onSave,
    onLogout,
    onFormDataChange,
}: ProfileInfoCardProps) => {
    return (
        <Card className="w-full max-w-4xl p-5 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <CardTitle className="flex items-center space-x-3 text-xl font-bold text-gray-800">
                        <UserCircle2 className="h-6 w-6 text-sky-600" />
                        <span>Profile Information</span>
                        {user.role !== Role_type.USER && (
                            <Badge className="ml-2 bg-sky-100 text-sky-800 hover:bg-sky-200 transition-colors duration-300">
                                {user.role}
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
                        {isEditing ? (
                            <>
                                <Button
                                    textButton="Cancel"
                                    onClick={onEditToggle}
                                    disabled={isUpdating}
                                    className="h-8 w-full sm:w-auto px-3 text-sm transition-all duration-300 hover:bg-gray-100"
                                />
                                <Button
                                    textButton="Save"
                                    onClick={onSave}
                                    className="h-8 w-full sm:w-auto px-3 text-sm transition-all duration-300 hover:bg-sky-600"
                                />
                            </>
                        ) : (
                            <>
                                <Button 
                                    textButton="Edit Profile" 
                                    onClick={onEditToggle}
                                    className="h-8 w-full sm:w-auto px-3 text-sm transition-all duration-300 hover:bg-sky-600"
                                />
                                <Button
                                    textButton="Logout"
                                    className="h-8 w-full sm:w-auto px-3 text-sm shadow-3xl transition-all duration-300 hover:bg-red-600"
                                    onClick={onLogout}
                                    disabled={isLoggingOut}
                                />
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-4 items-center gap-6">
                    {isEditing ? (
                        <>
                            <label className="block font-medium text-gray-700">Name</label>
                            <Input
                                value={formData.name || ""}
                                onChange={(e) =>
                                    onFormDataChange({ ...formData, name: e.target.value })
                                }
                                disabled={isUpdating}
                                className="col-span-3 transition-all duration-300 focus:ring-2 focus:ring-sky-500"
                            />

                            <label className="block font-medium text-gray-700">Email</label>
                            <Input
                                type="email"
                                value={formData.email || ""}
                                onChange={(e) =>
                                    onFormDataChange({ ...formData, email: e.target.value })
                                }
                                disabled={isUpdating}
                                className="col-span-3 transition-all duration-300 focus:ring-2 focus:ring-sky-500"
                            />
                            <label className="block font-medium text-gray-700">Year</label>
                            <select
                                name="year"
                                value={formData.year || 1}
                                onChange={(e) =>
                                    onFormDataChange({ ...formData, year: e.target.value })}
                                disabled={isUpdating}
                                className="col-span-3 rounded-md border border-gray-300 px-3 py-2 transition-all duration-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="" disabled>Select a year</option>
                                {[1, 2, 3, 4, 5, 6].map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </>
                    ) : (
                        <>
                            <strong className="text-gray-700">Name:</strong>{" "}
                            <span className="col-span-3 text-gray-600">{user.name}</span>
                            <strong className="text-gray-700">Email:</strong>
                            <span className="col-span-3 text-gray-600">{user.email}</span>
                            <strong className="text-gray-700">Year:</strong>
                            <span className="col-span-3 text-gray-600">{user.year}</span>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}; 