"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FrontendRoutes } from "../config/apiRoutes";
import { useUser } from '../hooks/useUser';

const ProtectedPage = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { user: currentUser } = useUser();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(FrontendRoutes.MAIN);
    }
    if (status === "authenticated" && currentUser?.status?.isBanned) {
      router.push(FrontendRoutes.BAN);
    }
  }, [status, router, currentUser]);

  if (status === "loading" || status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedPage;
