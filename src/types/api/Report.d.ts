import { Quiz } from './Quiz';
import { Keyword } from './Keyword';
import { UserProps } from './UserProps';

export interface Report {
    _id: string;
    User: UserProps;
    originalQuiz?: Quiz;
    suggestedChanges?: Quiz;
    originalKeyword?: Keyword;
    suggestedChangesKeyword?: Keyword;
    type: 'quiz' | 'keyword';
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    createdAt: Date;
}

