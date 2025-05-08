import { Subject } from "./Subject";

export interface Category {
  _id: string;
  subject: Subject | string;
  category: string;
  description: string;
}

