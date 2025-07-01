import { UserProps } from "./UserProps";
import { Subject } from "./Subject";
import { Category } from "./Category";

export interface Quiz {
    _id: string;
    user: UserProps;
    question: string;
    subject: Subject;
    category: Category;
    type: string;
    choice: Array<string>;
    correctAnswer: Array<string>;
    img: Array<string>;
    status: 'pending' | 'approved' | 'rejected' | 'reported';
    updatedAt: Date;
  }
  
