import axios from "axios";
import { BackendRoutes } from "../../config/apiRoutes";

export const useGetSubjectByID = async (subjectID:string) => {
    try {
        const response = await axios.get(`${BackendRoutes.SUBJECT}/${subjectID}`);
        return response.data.data;
    } catch (err) {
        return "Failed to fetch subject details.";
    }
}