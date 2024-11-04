import './App.css';
import Navbar from './components/navbar';
import Canvas from './components/Canvas';
import Signup from './components/signup';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [selectedTool, setSelectedTool] = useState('pen');

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    console.log(`Selected tool: ${tool}`);
  };

  return (
    <Router>
      <div className="App">
        <div className="header">Collaborative Whiteboard</div>

        {/* Render Navbar and pass handleToolSelect to it */}
        <Navbar onToolSelect={handleToolSelect} />

        {/* Define Routes */}
        <Routes>
          <Route path="/" element={<Canvas selectedTool={selectedTool} />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
