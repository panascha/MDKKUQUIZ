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
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
    quizCount: number;
    keywordCount: number;
    reportCount: number;
    total: number;
  }