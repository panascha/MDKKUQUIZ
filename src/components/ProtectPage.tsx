"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FrontendRoutes } from "../config/apiRoutes";

const ProtectedPage = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(FrontendRoutes.MAIN);
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return null; // or a spinner
  }

  return <>{children}</>;
};

export default ProtectedPage;
