import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { BackendRoutes } from "../../config/apiRoutes";
import { Subject } from "../../types/api/Subject";
import { uploadImageToBackend } from "../../lib/utils";

function isFile(obj: unknown): obj is File {
    return typeof obj === 'object' && obj !== null && 'name' in obj && obj instanceof File;
}

export const useCreateSubject = () => {
    const session = useSession();
    return useMutation({
        mutationFn: async (newSubject: Omit<Subject, "_id"|"createdAt" | "updatedAt">) => {
            if (!session?.data?.user.token) throw new Error("Authentication required");

            let imageUrl = "";
            if (isFile(newSubject.img)) {
                imageUrl = await uploadImageToBackend(newSubject.img, session.data.user.token);
            } else if (typeof newSubject.img === 'string') {
                imageUrl = newSubject.img;
            }

            const payload = {
                name: newSubject.name,
                description: newSubject.description,
                year: newSubject.year,
                img: imageUrl,
            };

            const response = await axios.post(BackendRoutes.SUBJECT, payload, {
                headers: {
                Authorization: `Bearer ${session.data.user.token}`,
                },
            });

            return response.data.data;
        },
    })
}