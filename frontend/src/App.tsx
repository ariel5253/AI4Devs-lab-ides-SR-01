import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RecruiterDashboard from './components/RecruiterDashboard';
import AddCandidateForm from './components/AddCandidateForm';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<RecruiterDashboard />} />
          <Route path="/add-candidate" element={<AddCandidateForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
