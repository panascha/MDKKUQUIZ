import { BackendRoutes } from "@/config/apiRoutes";
import { Stat } from "@/types/api/Stat";
import axios from "axios";
import { useSession } from "next-auth/react";

export interface StatsOverviewProps {
    stat: Stat;
}
export const useGetStatOverAll = () => {
  const { data: session } = useSession();
  
  return async () => {
    if (!session?.user.token) throw new Error("Authentication required");
    
    const response = await axios.get(`${BackendRoutes.STAT}`, {
      headers: { Authorization: `Bearer ${session.user.token}` },
    });
    return response.data.data as StatsOverviewProps;
  };
};