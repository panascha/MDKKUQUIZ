import { Subject } from "./Subject";

export interface Category {
  _id: string;
  subject: Subject;
  category: string;
  description: string;
}

