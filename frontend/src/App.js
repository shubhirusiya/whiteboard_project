import './App.css';
import Navbar from './components/navbar';
import Canvas from './components/Canvas';
import Signup from './components/signup';
import { useState } from 'react';
import Landingpage from './components/landing_page';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [selectedTool, setSelectedTool] = useState('pen');

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    console.log(`Selected tool: ${tool}`);
  };
  const handleFeatureSelect = (feature) => {
    // Handle feature selection (implement as needed)
    console.log('Selected feature:', feature);
  };

  return (
    <Router>
      <div className="App">

        <div className="header">Collaborative Whiteboard</div>

        {/* Render Navbar and pass handleToolSelect to it */}
        <Navbar 
        onToolSelect={handleToolSelect} 
        onFeatureSelect={handleFeatureSelect}
      />
        {/* Define Routes */}
        <Routes>
        <Route path="/" element={<Landingpage/>} />
          <Route path="/whiteboard" element={<Canvas selectedTool={selectedTool} />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
