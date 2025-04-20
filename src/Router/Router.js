import React from 'react'
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Main from "../pages/Main";
import Subjects from "../pages/Subjects";
import SubjectDetail from "../pages/SubjectDetail";
import Atlas from "../pages/Atlas";
import Keyword from "../pages/Keyword";
import Report from "../pages/Report";
import Quiz from "../pages/Quiz";
import QuizEdit from "../pages/QuizEdit";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />, // App wraps all routes, ensuring Navbar is always rendered
        errorElement: <div>404</div>,
        children: [
            { path: '/', element: <Home /> },
            { path: '/main', element: <Main /> },
            { path: '/subjects', element: <Subjects /> },
            { path: '/subject/:subjectName', element: <SubjectDetail /> },
            { path: '/atlas', element: <Atlas /> },
            { path: '/keyword', element: <Keyword /> },
            { path: '/report', element: <Report /> },
            { path: '/quiz/:subjectName', element: <Quiz /> },
            { path: '/quiz/:subjectName/edit', element: <QuizEdit /> },
        ],
    },
]);

export default router;


