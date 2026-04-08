import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Pages/LoginPage'
import HomePage from './Pages/HomePage';
import MainLayout from './Pages/MainLayout';
import Tasks from './Pages/Tasks';
import ProtectedRoute from './Pages/ProtectedRoute.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<LoginPage />} />   */}
        <Route path="/" element={<Navigate to='/login' replace />} /> 
        {/* pentru cand bag token.. dac anu esti auth te baga in login altfel te duce direct in home */}
        
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/tasks" element={<Tasks />} />
            </Route>
        </Route>

        
        
      </Routes>
    </Router>
  );
}

export default App;
