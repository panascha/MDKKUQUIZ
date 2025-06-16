import { BackendRoutes } from "@/config/apiRoutes";
import axios from "axios";

export const useGetSubjectByID = async (subjectID:string) => {
    try {
        const response = await axios.get(`${BackendRoutes.SUBJECT}/${subjectID}`, {
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        });
        return response.data.data;
    } catch (err) {
        return "Failed to fetch subject details.";
    }
}