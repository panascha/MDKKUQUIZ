export const MAINTENANCE_MODE = false;

export const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const BackendRootRoutes = `${BACKEND_URL}/api/v1`;

export const BackendRoutes = {
  LOGOUT: `${BackendRootRoutes}/auth/logout`,
  LOGIN: `${BackendRootRoutes}/auth/login`,
  REQUEST_OTP: `${BackendRootRoutes}/auth/request-reset-otp`,
  VERIFY_OTP: `${BackendRootRoutes}/auth/verify-otp`,
  RESET_PASSWORD: `${BackendRootRoutes}/auth/reset-password`,
  REGISTER: `${BackendRootRoutes}/auth/register`,
  UPDATE_USER: `${BackendRootRoutes}/auth/updateUser`,
  USER_INFO: `${BackendRootRoutes}/auth/me`,
  SUBJECT: `${BackendRootRoutes}/subject`,
  SUBJECT_BY_ID: `${BackendRootRoutes}/subject/:subjectID`,
  CATEGORY: `${BackendRootRoutes}/category`,
  CATEGORY_BY_ID: `${BackendRootRoutes}/category/:categoryID`,
  CATEGORY_BY_SUBJECTID: `${BackendRootRoutes}/category/subject/:subjectID`,
  QUIZ: `${BackendRootRoutes}/quiz`,
  QUIZ_FILTER: `${BackendRootRoutes}/quiz/filter`,
  QUIZ_BY_ID: `${BackendRootRoutes}/quiz/:questionID`,
  KEYWORD: `${BackendRootRoutes}/keyword`,
  KEYWORD_BY_ID: `${BackendRootRoutes}/keyword/:keywordID`,
  KEYWORD_APP: `${BackendRootRoutes}/keyword/approved`,
  SCORE: `${BackendRootRoutes}/score`,
  SCORE_USERID: `${BackendRootRoutes}/score/user/:UserID`,
  REPORT: `${BackendRootRoutes}/report`,
  STAT: `${BackendRootRoutes}/stat/overall`,
  APPROVED_QUIZ: `${BackendRootRoutes}/approved/quiz`,
  APPROVED_KEYWORD: `${BackendRootRoutes}/approved/keyword`,
  APPROVED_REPORT: `${BackendRootRoutes}/approved/report`,
  DAILY_ACTIVITY: `${BackendRootRoutes}/stat/daily-activity`,
  USER_STATS: `${BackendRootRoutes}/stat/user-stats`,
  BAN_USER: `${BackendRootRoutes}/auth/ban`,
  UNBAN_USER: `${BackendRootRoutes}/auth/unban`,
} as const;

export const getQuizByFilter = (subjectID?: string, categoryID?: string): string => {
  let path: string = BackendRoutes.QUIZ_FILTER;

  if (subjectID) path += `/${subjectID}`;
  if (categoryID) path += `/${categoryID}`;

  return path;
};

export const getCategoryBySubjectID = (subjectID: string): string =>
  BackendRoutes.CATEGORY_BY_SUBJECTID.replace(
    ":subjectID",
    subjectID,
);


export const getScoreByUserID = (UserID: string): string =>
  BackendRoutes.SCORE_USERID.replace(
    ":UserID",
    UserID,
  );

export const getQuestionByID = (questionID: string): string =>
  BackendRoutes.QUIZ_BY_ID.replace(":questionID", questionID);


export enum FrontendRootRoutes {
  LOGIN = "/login",
  PROFILE = "/profile",
  MAIN = "/main",
  HOMEPAGE = "/home",
  SETUP_QUIZ = "/setup-quiz",
  QUIZ = "/quiz",
  QUESTION = "/question",
  KEYWORD = "/keyword",
  REPORT = "/report",
  QUESTION_CREATE = "/question/create",
  ADMIN = "/admin",
  BAN = "/ban",
  RESET_PASSWORD = "/reset-password",
  MAINTENANCE = "/maintenance"
}
export enum FrontendRoutes {
  HOMEPAGE = FrontendRootRoutes.HOMEPAGE,
  MAIN = FrontendRootRoutes.MAIN,
  LOGIN = `${FrontendRootRoutes.LOGIN}`,
  PROFILE = `${FrontendRootRoutes.PROFILE}`,
  SETUP_QUIZ = `${FrontendRootRoutes.SETUP_QUIZ}`,
  QUIZ = `${FrontendRootRoutes.QUIZ}`,
  QUESTION = `${FrontendRootRoutes.QUESTION}`,
  KEYWORD = `${FrontendRootRoutes.KEYWORD}`,
  REPORT = `${FrontendRootRoutes.REPORT}`,
  QUESTION_CREATE = `${FrontendRootRoutes.QUESTION_CREATE}`,
  ADMIN = `${FrontendRootRoutes.ADMIN}`,
  BAN = `${FrontendRootRoutes.BAN}`,
  RESET_PASSWORD = `${FrontendRootRoutes.RESET_PASSWORD}`,
  MAINTENANCE = `${FrontendRootRoutes.MAINTENANCE}`,
}
