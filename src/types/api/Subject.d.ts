import type { Category } from "./Category";

export interface Subject {
    _id: string;
    name: string;
    description: string;
    img: string;
    Category?: Category[];
}
  
