import { UserProps } from './User';
import { Quiz } from './Quiz';
import { Keyword } from './Keyword';
export interface Report {
    _id: string;
    user: UserProps;
    type: 'question' | 'keyword';
    description: string;
    current: Quiz | Keyword;
    reported: Quiz | Keyword;
    status: 'Under review' | 'Approved' | 'Rejected';
    createdAt: Date;
}