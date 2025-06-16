import { Subject } from "@/types/api/Subject";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BackendRoutes } from "@/config/apiRoutes";
import { useSession } from "next-auth/react";

export const useCreateSubject = () => {
    const session = useSession();
    return useMutation({
        mutationFn: async (newSubject: Omit<Subject, "_id"|"createAt">) => {
            if (!session?.data?.user.token) throw new Error("Authentication required");

            const formDataPayload = new FormData();
            formDataPayload.append("name", newSubject.name);
            formDataPayload.append("description", newSubject.description);
            formDataPayload.append("year", newSubject.year.toString());
            // Ensure image is added correctly as file, only if it's not null
            if (newSubject.img) {
                formDataPayload.append("image", newSubject.img); // img is now a File
            }

            const response = await axios.post(BackendRoutes.SUBJECT, formDataPayload, {
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