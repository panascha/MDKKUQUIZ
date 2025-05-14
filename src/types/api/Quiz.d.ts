import { UserProps } from "./UserProps";
import { Subject } from "./Subject";
import { Category } from "./Category";

export interface Quiz {
    _id: string;
    user: UserProps;
    question: string;
    subject: Subject;
    category: Category;
    type: Array<string>;
    choice: Array<string>;
    correctAnswer: Array<string>;
    img: Array<string>;
    img_citation: Array<string>;
    explaination: string;
    approved: Boolean;
  }
  
