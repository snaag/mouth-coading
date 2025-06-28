import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import ProfilePage from './ProfilePage';
import MentorListPage from './MentorListPage';
import MatchRequestsPage from './MatchRequestsPage';
import IncomingRequestsPage from './IncomingRequestsPage';
import OutgoingRequestsPage from './OutgoingRequestsPage';
import SwaggerPage from './SwaggerPage';

function App() {
  const token = localStorage.getItem('token');
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={token ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/mentors" element={token ? <MentorListPage /> : <Navigate to="/login" />} />
        <Route path="/match-requests" element={token ? <MatchRequestsPage /> : <Navigate to="/login" />} />
        <Route path="/match-requests/incoming" element={token ? <IncomingRequestsPage /> : <Navigate to="/login" />} />
        <Route path="/match-requests/outgoing" element={token ? <OutgoingRequestsPage /> : <Navigate to="/login" />} />
        <Route path="/swagger-ui" element={<SwaggerPage />} />
        <Route path="/" element={<Navigate to="/mentors" />} />
      </Routes>
    </Router>
  );
}

export default App;
