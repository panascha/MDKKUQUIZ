"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BackendRoutes, FrontendRoutes } from "../config/apiRoutes";
import type { User } from "../types/User";

const getUserProfile = async (token: string) => {
  try {
    const response = await axios.get(BackendRoutes.USER_INFO, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {...response.data.data, token};
  } catch (error) {
    throw new Error(
      "Failed to get user profile: " + (error as AxiosError).message,
    );
  }
};

/**
 * Custom hook using TanStack Query to fetch and provide user information
 * @returns Query result with user data, loading state, and error
 */
export const  useUser = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: user,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["userProfile", session?.user?.token],
    queryFn: () => {
      if (!session?.user?.token) return null;
      return getUserProfile(session.user.token);
    },
    enabled: !!session?.user?.token,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      if (!user?._id || !session?.user.token) {
        throw new Error("User ID or token not available");
      }
      const response = await axios.put(
        `${BackendRoutes.UPDATE_USER}/${user._id}`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.user.token}`,
          },
        },
      );
      return response.data;
    },
    onMutate: (newUserData) => {
      if (user) {
        const optimisticUser = { ...user, ...newUserData };
        queryClient.setQueryData(
          ["userProfile", session?.user?.token],
          optimisticUser,
        );
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["userProfile", session?.user?.token],
        (prev: User) => ({
          ...prev,
          ...data,
        }),
      );
    },
    onError: (error) => {
      console.error("Failed to update user:", error);
    },
  });

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      return await signOut({ redirect: false, callbackUrl: "/" });
    },
    onSuccess: () => {
      queryClient.clear(); // Clear all query cache on logout
      router.push(FrontendRoutes.HOMEPAGE);
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      router.push(FrontendRoutes.HOMEPAGE);
    },
  });

  return {
    user,
    loading,
    error: error as Error | null,
    updateUser,
    isUpdating,
    logout,
    isLoggingOut,
  };
};
