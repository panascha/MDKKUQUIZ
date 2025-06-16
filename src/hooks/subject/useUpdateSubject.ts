import { Subject } from "@/types/api/Subject";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BackendRoutes } from "@/config/apiRoutes";
import { useSession } from "next-auth/react";

export const useUpdateSubject = () => {
    const session = useSession();
    return useMutation({
        mutationFn: async ({ id, updatedData }: { id: string; updatedData: Partial<Subject> }) => {
            if (!session?.data?.user.token) throw new Error("Authentication required");
        
            const formData = new FormData();
            if (updatedData.name) formData.append("name", updatedData.name);
            if (updatedData.description) formData.append("description", updatedData.description);
            if (updatedData.year) formData.append("year", updatedData.year.toString());
            if (
            updatedData.img &&
            typeof updatedData.img === "object" &&
            "name" in updatedData.img
            ) {
            formData.append("image", updatedData.img as File);
            } else if (updatedData.img) {
            formData.append("image", updatedData.img as string);
            }
        
            const response = await axios.put(`${BackendRoutes.SUBJECT}/${id}`, formData, {
            headers: {
                Authorization: `Bearer ${session.data.user.token}`,
                "Content-Type": "multipart/form-data",
                "ngrok-skip-browser-warning": "true"
            },
            });
        
            return response.data.data;
        },
    })
}