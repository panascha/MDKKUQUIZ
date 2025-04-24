import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthContext } from './api/auth/AuthContext';
import './App.css';
import Navbar from './components/Navbar';
import Main from './pages/Main';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import Atlas from './pages/Atlas';
import Keyword from './pages/Keyword';
import Report from './pages/Report';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import QuizEdit from './pages/QuizEdit';
import QuizProblem from './pages/QuizProblem';


function App() {
  const { isLoggedIn } = React.useContext(AuthContext);
  return (
    <>
      <div className="App">
        <Navbar />
        <div className="pt-10">
          <Routes>
            <Route path="/" element={isLoggedIn ? <Main /> : <Home />} />
            <Route path="/quiz/:subjectName" element={<Quiz />} />
            <Route path="/quiz/:subjectName/problem" element={<QuizProblem />} />
            <Route path="/quiz/:subjectName/edit" element={<QuizEdit />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/subject/:subjectName" element={<SubjectDetail />} />
            <Route path="/atlas" element={<Atlas />} />
            <Route path="/keyword" element={<Keyword />} />
            <Route path="/report" element={<Report />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
