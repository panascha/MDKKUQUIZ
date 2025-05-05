"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { FrontendRoutes } from "@/config/apiRoutes";
import React from "react";

const ProtectedPage = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;

  if (!session) {
    redirect(FrontendRoutes.HOMEPAGE);
    return null; // Prevent further rendering
  }

  return <>{children}</>;
};

export default ProtectedPage;
