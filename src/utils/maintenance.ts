import { MAINTENANCE_MODE } from "../config/apiRoutes";

export function isMaintenanceMode(): boolean {
  return MAINTENANCE_MODE;
}

export function checkMaintenanceAccess(pathname: string): {
  isAllowed: boolean;
  shouldRedirect: boolean;
  redirectTo?: string;
} {
  const isMaintenancePage = pathname === '/maintenance';
  
  if (MAINTENANCE_MODE) {
    if (isMaintenancePage) {
      return { isAllowed: true, shouldRedirect: false };
    } else {
      return { 
        isAllowed: false, 
        shouldRedirect: true, 
        redirectTo: '/maintenance' 
      };
    }
  } else {
    if (isMaintenancePage) {
      return { 
        isAllowed: false, 
        shouldRedirect: true, 
        redirectTo: '/main' 
      };
    } else {
      return { isAllowed: true, shouldRedirect: false };
    }
  }
}
