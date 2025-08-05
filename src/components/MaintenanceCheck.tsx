"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MAINTENANCE_MODE, FrontendRoutes } from "../config/apiRoutes";

interface MaintenanceCheckProps {
  children: React.ReactNode;
}

export default function MaintenanceCheck({ children }: MaintenanceCheckProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If maintenance mode is enabled and user is not already on maintenance page
    if (MAINTENANCE_MODE && pathname !== FrontendRoutes.MAINTENANCE) {
      router.push(FrontendRoutes.MAINTENANCE);
    }
    // If maintenance mode is disabled and user is on maintenance page, redirect to main
    else if (!MAINTENANCE_MODE && pathname === FrontendRoutes.MAINTENANCE) {
      router.push(FrontendRoutes.MAIN);
    }
  }, [pathname, router]);

  // If maintenance mode is enabled and not on maintenance page, don't render children
  if (MAINTENANCE_MODE && pathname !== FrontendRoutes.MAINTENANCE) {
    return null;
  }

  return <>{children}</>;
}
