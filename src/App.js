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


function App() {
  const { isLoggedIn } = React.useContext(AuthContext);
  return (
    <>
      <div className="App">
        <Navbar />
        <div className="pt-10">
          <Routes>
            <Route path="/" element={isLoggedIn ? <Main /> : <Home />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/subject/:subjectName" element={<SubjectDetail />} component={SubjectDetail} />
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
