import { UserProps } from './User';
import { Subject } from './Subject';

export interface Keyword {
    _id: string;
    user: UserProps;
    subject: Subject;
    name: string;
    keyword: Array<string>;
    description: string;
    approved: Boolean;
}