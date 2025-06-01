import { UserProps } from './User';
import { Subject } from './Subject';
import { Category } from './Category';

export interface Keyword {
    _id: string;
    user: UserProps;
    subject: Subject;
    category: Category;
    name: string;
    keyword: Array<string>;
    approved: Boolean;
}