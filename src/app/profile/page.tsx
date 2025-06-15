"use client";
import { Skeleton } from "@/components/ui/Skeleton";
import { BackendRoutes } from "@/config/apiRoutes";
import { useUser } from "@/hooks/useUser";
import { UserScore } from "@/types/api/Score";
import { User } from "@/types/User";
import axios from "axios";
import { LoaderCircleIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ProfileInfoCard } from "@/components/profile/ProfileInfoCard";
import { ScoresSection } from "@/components/profile/ScoresSection";

const Page = () => {
    const session = useSession();
    const { user, loading, updateUser, isUpdating, logout, isLoggingOut } = useUser();
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
            <section className="flex w-full flex-col items-center justify-center">
                <p className="text-3xl font-semibold text-gray-800">Your Profile</p>
            </section>

            {/* Profile Information Card */}
            <section className="flex w-full justify-center px-4 ">
                <ProfileInfoCard
                    user={user}
                    isEditing={isEditing}
                    isUpdating={isUpdating}
                    isLoggingOut={isLoggingOut}
                    formData={formData}
                    onEditToggle={handleEditToggle}
                    onSave={handleSave}
                    onLogout={handleLogout}
                    onFormDataChange={setFormData}
                />
            </section>

            {/* Scores Section */}
            <section className="flex w-full justify-center px-4 ">
                <ScoresSection
                    isLoading={isLoadingScores}
                    scores={score}
                />
            </section>
        </main>
    );
};

export default Page;
