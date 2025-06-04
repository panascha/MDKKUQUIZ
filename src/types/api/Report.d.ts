import { Quiz } from './Quiz';
import { Keyword } from './Keyword';
import { User } from '../User';

export interface Report {
    _id: string;
    User: UserProps;
    originalQuiz: Quiz;
    suggestedChanges: Quiz;
    status: 'pending' | 'approved' | 'rejected';
    approvedAdmin: Array<User>;
    reason: string;
    createdAt: Date;
}

