import React from 'react'
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Quiz from "../pages/Quiz";
import Main from "../pages/Main";
import Subject from "../pages/Subject";
import Atlas from "../pages/Atlas";
import Keyword from "../pages/Keyword";
import Report from "../pages/Report";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <div>404</div>,
        children: [
            { path: '/', element: <Home />, },
            { path: '/quiz', element: <Quiz />, },
            { path: '/main', element: <Main />, },
        ]
    },
    { path: '/subject', element: <Subject />, },
    { path: '/atlas', element: <Atlas />, },
    { path: '/keyword', element: <Keyword />, },
    { path: '/report', element: <Report />, },
]);

export default router;


