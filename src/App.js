import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthContext } from './pages/api/auth/AuthContext';
import './App.css';
import Navbar from './components/Navbar';
import Main from './pages/Main';
import AnotherPage from './pages/Subject';
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
          {isLoggedIn ? (
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/subject" element={<AnotherPage />} />
              <Route path="/atlas" element={<Atlas />} />
              <Route path="/keyword" element={<Keyword />} />
              <Route path="/report" element={<Report />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          )}
        </div>


      </div>
    </>
  );
}

export default App;
