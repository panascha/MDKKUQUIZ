import { User } from "../User";

export interface Stat {
    totalQuizzes?: number;
    totalReports?: number;
    totalKeywords?: number;
    totalUsers?: number;
    totalPendingQuizzes?: number;
    totalPendingKeywords?: number;
    totalPendingReports?: number;
}

export interface UserStat {
    user: User;
    quizCount: number;
    keywordCount: number;
    reportCount: number;
    total: number;
    allKeywordsUsed: boolean;
  }