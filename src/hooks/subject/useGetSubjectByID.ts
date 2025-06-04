import { BackendRoutes } from "@/config/apiRoutes";
import axios from "axios";

export const useGetSubjectByID = async (subjectID:string) => {
    try {
        const response = await axios.get(`${BackendRoutes.SUBJECT}/${subjectID}`);
        return response.data.data;
    } catch (err) {
        return "Failed to fetch subject details.";
    }
}