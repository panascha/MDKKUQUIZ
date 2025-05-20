import { Quiz } from "./Quiz";

export interface Question {
    quiz: Quiz;
    select?: string | null;
    isBookmarked?: boolean;
    isAnswered?: boolean;
    isSubmitted?: boolean;
    isCorrect?: boolean | null;
}