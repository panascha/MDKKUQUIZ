"use client";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { BackendRoutes } from "@/config/apiRoutes";
import { Role_type } from "@/config/role";
import { useUser } from "@/hooks/useUser";
import { UserScore } from "@/types/api/Score";
import { User } from "@/types/User";
import axios from "axios";
import { LoaderCircleIcon, UserCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ScoreCard from "@/components/profile/ScoreCard";

const Page = () => {
    const session = useSession();
    const { user, loading, updateUser, isUpdating, logout, isLoggingOut } =
        useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [score, setScore] = useState<UserScore[]>([]);
    const [isLoadingScores, setIsLoadingScores] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            if (!user?._id || !session.data?.user.token) {
                setIsLoadingScores(false);
                return;
            }

            try {
                setIsLoadingScores(true);
                const response = await axios.get(
                    `${BackendRoutes.SCORE}/user/${user._id}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${session.data.user.token}`,
                        },
                    }
                );
                setScore(response.data.data);
            } catch (error) {
                console.error("Error fetching scores:", error);
                toast.error("Failed to load scores");
            } finally {
                setIsLoadingScores(false);
            }
        };
        
        fetchScores();
    }, [user?._id, session.data?.user.token]); 

    const handleLogout = () => {
        toast.promise(
        new Promise((resolve, reject) => {
            logout(undefined, {
            onSuccess: () => resolve("Logged out successfully!"),
            onError: (error) => reject(error),
            });
        }),
        {
            loading: "Logging out...",
            success: "Logged out successfully!",
            error: "Logout failed. Please try again.",
        },
        );
    };

    const handleEditToggle = () => {
        if (!isEditing && user) {
        setFormData({
            name: user.name,
            email: user.email,
        });
        }
        setIsEditing(!isEditing);
    };

    const handleSave = () => {
        toast.promise(
        new Promise((resolve, reject) => {
            updateUser(formData, {
            onSuccess: () => {
                setIsEditing(false);
                resolve("Profile updated successfully!");
            },
            onError: (error) => {
                reject(error);
            },
            });
        }),
        {
            loading: "Updating profile...",
            success: "Profile updated successfully!",
            error: "Failed to update profile",
        },
        );
    };

    if (loading) {
        return (
        <div className="place-items-center pt-20">
            <Skeleton className="h-72 w-lg place-items-center pt-5 shadow-lg">
            <LoaderCircleIcon className="animate-spin" />
            </Skeleton>
        </div>
        );
    }

    if (!user) {
        return (
        <div className="place-items-center pt-20">
            <Skeleton className="h-72 w-lg place-items-center pt-5 shadow-lg">
            <LoaderCircleIcon className="animate-spin" />
            </Skeleton>
        </div>
        );
    }

    return (
        <main className="space-y-10 px-4 md:px-10 pt-20">
            <section className="flex w-full flex-col items-center justify-center pt-10">
                <p className="text-3xl font-semibold text-gray-800">Your Profile</p>
            </section>

            {/* Profile Information Card */}
            <section className="flex w-full justify-center px-4">
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
                                            onClick={handleEditToggle}
                                            disabled={isUpdating}
                                            className="h-8 w-full sm:w-auto px-3 text-sm transition-all duration-300 hover:bg-gray-100"
                                        />
                                        <Button
                                            textButton="Save"
                                            onClick={handleSave}
                                            className="h-8 w-full sm:w-auto px-3 text-sm transition-all duration-300 hover:bg-sky-600"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Button 
                                            textButton="Edit Profile" 
                                            onClick={handleEditToggle}
                                            className="h-8 w-full sm:w-auto px-3 text-sm transition-all duration-300 hover:bg-sky-600"
                                        />
                                        <Button
                                            textButton="Logout"
                                            className="h-8 w-full sm:w-auto px-3 text-sm shadow-3xl transition-all duration-300 hover:bg-red-600"
                                            onClick={handleLogout}
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
                                        setFormData({ ...formData, name: e.target.value })
                                        }
                                        disabled={isUpdating}
                                        className="col-span-3 transition-all duration-300 focus:ring-2 focus:ring-sky-500"
                                    />

                                    <label className="block font-medium text-gray-700">Email</label>
                                    <Input
                                        type="email"
                                        value={formData.email || ""}
                                        onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                        }
                                        disabled={isUpdating}
                                        className="col-span-3 transition-all duration-300 focus:ring-2 focus:ring-sky-500"
                                    />
                                    <label className="block font-medium text-gray-700">Year</label>
                                    <select
                                        name="year"
                                        value={formData.year || 1}
                                        onChange={(e) =>
                                        setFormData({ ...formData, year: e.target.value })}
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
            </section>

            {/* Scores Section */}
            <section className="flex w-full justify-center px-4">
                {isLoadingScores ? (
                    <div className="w-full max-w-4xl">
                        <Skeleton className="h-72 w-full" />
                    </div>
                ) : score.length > 0 ? (
                    <div className="w-full max-w-4xl">
                        <ScoreCard scores={score} />
                    </div>
                ) : (
                    <Card className="w-full max-w-4xl p-5 shadow-xl transition-all duration-300 hover:shadow-2xl">
                        <CardContent className="flex items-center justify-center py-10">
                            <p className="text-gray-500">No scores available yet.</p>
                        </CardContent>
                    </Card>
                )}
            </section>
        </main>
    );
};

export default Page;
