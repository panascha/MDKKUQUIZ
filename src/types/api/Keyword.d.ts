import { UserProps } from './User';
import { Subject } from './Subject';
import { Category } from './Category';

export interface Keyword {
    _id: string;
    user: UserProps;
    name: string;
    subject: Subject;
    status: string;
    category: Category;
    keywords: Array<string>;
    isGlobal: boolean;
    createdAt: Date;
    updatedAt: Date;
}