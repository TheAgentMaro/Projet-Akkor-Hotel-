import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Routes will be added here */}
          <Route path="/" element={<div>Welcome to Akkor Hotel</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
