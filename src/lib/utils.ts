import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BACKEND_URL } from "../config/apiRoutes";

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

export async function uploadImageToBackend(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${BACKEND_URL}/api/v1/images/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data.url;
}
