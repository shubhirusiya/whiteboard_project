import './App.css';
import Navbar from './components/navbar';
import Canvas from './components/Canvas';
import Signup from './components/signup';
import { useState } from 'react';
import Landingpage from './components/landing_page';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

function AppContent() {
  const [selectedTool, setSelectedTool] = useState('pen');

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    console.log(`Selected tool: ${tool}`);
  };

  const handleFeatureSelect = (feature) => {
    console.log('Selected feature:', feature);
  };

  const location = useLocation(); // Get the current location

  return (
    <div className="App">
    
      {/* Conditionally render Navbar only for the Canvas page */}
      {location.pathname === '/canvas' && (
        <Navbar onToolSelect={handleToolSelect} onFeatureSelect={handleFeatureSelect} />
      )}

      {/* Define Routes */}
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/canvas" element={<Canvas selectedTool={selectedTool} />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
