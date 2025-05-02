const BACKEND_URL = "https://medquizbackend.onrender.com";
//const BACKEND_URL = "http://127.0.0.1:5003";
const BackendRootRoutes = `${BACKEND_URL}/api/v1`;

export enum BackendRoutes {
  LOGOUT = `${BackendRootRoutes}/auth/logout`,
  LOGIN = `${BackendRootRoutes}/auth/login`,
  REGISTER = `${BackendRootRoutes}/auth/register`,
  UPDATE_USER = `${BackendRootRoutes}/auth/updateUser`,
  USER_INFO = `${BackendRootRoutes}/auth/me`,
  QUIZ = `${BackendRootRoutes}/quiz`,
  QUIZ_CATEGORYID = `${BackendRootRoutes}/quiz/cate/:categoryID`,
  SCORE = `${BackendRootRoutes}/score`,
  SCORE_USERID = `${BackendRootRoutes}/score/user/:UserID`,
  CATEGORY = `${BackendRootRoutes}/category`
  
}

export const getQuizByCategoryID = (categoryID: string): string =>
  BackendRoutes.QUIZ_CATEGORYID.replace(
    ":categoryID",
    categoryID,
);

export const getScoreByUserID = (UserID: string): string =>
  BackendRoutes.SCORE_USERID.replace(
    ":UserID",
    UserID,
);

export enum FrontendRootRoutes {
  DASHBOARD = "/dashboard",
  LIST = "/list",
  LOGIN = "/login",
  PROFILE = "/profile",
  MAIN = "/main",
  HOMEPAGE = "/home",
}
export enum FrontendRoutes {
  HOMEPAGE = FrontendRootRoutes.HOMEPAGE,
  DASHBOARD = FrontendRootRoutes.DASHBOARD,
  MAIN = FrontendRootRoutes.MAIN,
  ADMIN = `${FrontendRoutes.DASHBOARD}/admin`,
  USER = `${FrontendRootRoutes.DASHBOARD}/users`,
  DENTIST_LIST = `${FrontendRootRoutes.LIST}`,
  LOGIN = `${FrontendRootRoutes.LOGIN}`,
  PROFILE = `${FrontendRootRoutes.PROFILE}`,
}
