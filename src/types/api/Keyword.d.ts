import { UserProps } from './User';
import { Subject } from './Subject';
import { Category } from './Category';

export interface Keyword {
    _id: string;
    user: UserProps;
    name: string;
    subject: Subject;
    category: Category;
    keywords: Array<string>;
    status: string;
    updatedAt: Date;
}