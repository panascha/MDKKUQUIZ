import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BackendRoutes } from "@/config/apiRoutes";
import { useSession } from "next-auth/react";

export const useDeleteQuiz = () => {
    const session = useSession();
    return useMutation({
        mutationFn: async (id: string) => {
          if (!session?.data?.user.token) throw new Error("Authentication required");
          await axios.delete(`${BackendRoutes.QUIZ}/${id}`, {
            headers: {
              Authorization: `Bearer ${session.data.user.token}`,
              "ngrok-skip-browser-warning": "true"
            }
          });
        },
    })
}