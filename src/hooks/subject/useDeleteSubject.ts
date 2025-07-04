import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { BackendRoutes } from "../../config/apiRoutes";

export const useDeleteSubject = () => {
    const session = useSession();
    return useMutation({
        mutationFn: async (id: string) => {
          if (!session?.data?.user.token) throw new Error("Authentication required");
          await axios.delete(`${BackendRoutes.SUBJECT}/${id}`, {
            headers: { Authorization: `Bearer ${session.data.user.token}` },
          });
        },
    })
}