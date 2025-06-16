import { BackendRoutes } from "@/config/apiRoutes";
import axios, { AxiosError } from "axios";

export default async function userLogIn(
  userEmail: string,
  userPassword: string,
) {
  try {
    const response = await axios.post(
      BackendRoutes.LOGIN,
      {
        email: userEmail,
        password: userPassword,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
      },
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to log in");
    }
    throw new Error("An unexpected error occurred");
  }
}
