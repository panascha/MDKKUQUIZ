import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { BackendRoutes } from "../../config/apiRoutes";
import { Subject } from "../../types/api/Subject";

export const useCreateSubject = () => {
    const session = useSession();
    return useMutation({
        mutationFn: async (newSubject: Omit<Subject, "_id"|"createdAt" | "updatedAt">) => {
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
                },
            });

            return response.data.data;
        },
    })
}