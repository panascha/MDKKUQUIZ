//const BACKEND_URL = "https://medquizbackend.onrender.com";
const BACKEND_URL = "http://localhost:5000";
const BackendRootRoutes = `${BACKEND_URL}/api/v1`;

export enum BackendRoutes {
  LOGOUT = `${BackendRootRoutes}/auth/logout`,
  LOGIN = `${BackendRootRoutes}/auth/login`,
  REGISTER = `${BackendRootRoutes}/auth/register`,
  UPDATE_USER = `${BackendRootRoutes}/auth/updateUser`,
  USER_INFO = `${BackendRootRoutes}/auth/me`,
  SUBJECT = `${BackendRootRoutes}/subject`,
  CATEGORY = `${BackendRootRoutes}/category`,
  CATEGORY_BY_SUBJECTID = `${BackendRootRoutes}/category/subject/:subjectID`,
  QUIZ = `${BackendRootRoutes}/quiz`,
  QUIZ_FILTER = `${BackendRootRoutes}/quiz/filter`,
  SCORE = `${BackendRootRoutes}/score`,
  SCORE_USERID = `${BackendRootRoutes}/score/user/:UserID`,
}

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

export enum FrontendRootRoutes {
  LOGIN = "/login",
  PROFILE = "/profile",
  MAIN = "/main",
  HOMEPAGE = "/home",
  QUIZ = "/quiz",
  QUESTION = "/question",
  KEYWORD = "/keyword",
}
export enum FrontendRoutes {
  HOMEPAGE = FrontendRootRoutes.HOMEPAGE,
  MAIN = FrontendRootRoutes.MAIN,
  LOGIN = `${FrontendRootRoutes.LOGIN}`,
  PROFILE = `${FrontendRootRoutes.PROFILE}`,
  QUIZ = `${FrontendRootRoutes.QUIZ}`,
  QUESTION = `${FrontendRootRoutes.QUESTION}`,
  KEYWORD = `${FrontendRootRoutes.KEYWORD}`,
}
