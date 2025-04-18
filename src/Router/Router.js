import React from 'react'
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Quiz from "../pages/Quiz";
const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <div>404</div>,
        children: [
            { path: '/', element: <Home />, },
            { path: '/quiz', element: <Quiz />, },
        ]
    }
]);

export default router;

