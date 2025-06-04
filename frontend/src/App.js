import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import FamilyDetails from './components/FamilyProfile/FamilyDetails';
import AuthCallback from './components/AuthCallback';
import LandingPage from './components/landing';
import EducationPage from './components/Education/EducationPage';
import MarriagePage from './components/Marriage/MarriagePage';
import InvestmentPage from './components/Investment/InvestmentPage';
import Login from './components/Login';
import Register from './components/Registration'




function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/family-details" element={<FamilyDetails />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/Education" element={<EducationPage />} />
                <Route path="/marriage" element={<MarriagePage />} />
                <Route path="/investment" element={<InvestmentPage />} />
                <Route path="/login" element={<Login/>} />
                <Route path="/register" element={<Register/>}/>
            </Routes>
        </Router>
    );
}

export default App;
