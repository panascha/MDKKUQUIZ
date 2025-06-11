import { UserProps } from './User';
import { Quiz } from './Quiz';
import { Subject } from './Subject';
import { Category } from './Category';

export interface Question {
    Quiz: Quiz;
    Answer: String;
    isCorrect: boolean;
    isBookmarked: boolean;
}

export interface UserScore {
    _id: string;
    user: UserProps;
    Subject: Subject;
    Category: Category[];
    Score: Number;
    FullScore: Number;
    Question: Question[];
    timeTaken: Number;
    createdAt: Date;
}
