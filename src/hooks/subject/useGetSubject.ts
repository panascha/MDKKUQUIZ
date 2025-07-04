
import axios from "axios";
import { Subject } from "../../types/api/Subject";
import { BackendRoutes } from "../../config/apiRoutes";

export const useGetSubject = async (): Promise<Array<Subject>> => {
    const response = await axios.get(BackendRoutes.SUBJECT);
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }
    throw new Error("Failed to fetch dentists data");
};