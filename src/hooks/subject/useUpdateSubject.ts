import { Subject } from "../../types/api/Subject";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { BackendRoutes } from "../../config/apiRoutes";
import { uploadImageToBackend } from "../../lib/utils";

function isFile(obj: unknown): obj is File {
    return typeof obj === 'object' && obj !== null && 'name' in obj && obj instanceof File;
}

export const useUpdateSubject = () => {
    const session = useSession();
    return useMutation({
        mutationFn: async ({ id, updatedData }: { id: string; updatedData: Partial<Subject> }) => {
            if (!session?.data?.user.token) throw new Error("Authentication required");

            let imageUrl = "";
            if (isFile(updatedData.img)) {
                imageUrl = await uploadImageToBackend(updatedData.img, session.data.user.token);
            } else if (typeof updatedData.img === 'string') {
                imageUrl = updatedData.img;
            }

            const payload: Partial<Subject> = {
                name: updatedData.name,
                description: updatedData.description,
                year: updatedData.year,
            };

            // Only add img to payload if we have an image (new upload or existing)
            if (imageUrl) {
                payload.img = imageUrl;
            }

            const response = await axios.put(`${BackendRoutes.SUBJECT}/${id}`, payload, {
                headers: {
                    Authorization: `Bearer ${session.data.user.token}`,
                },
            });

            return response.data.data;
        },
    })
}