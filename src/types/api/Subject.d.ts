import type { Category } from "./Category";

export interface Subject {
    _id: string;
    name: string;
    description: string;
    img: string;
    year:number;
    Category: Category[];
    updatedAt: Date;
}
  
