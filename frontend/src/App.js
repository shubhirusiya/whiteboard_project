import './App.css';
import Navbar from './components/navbar';
import Canvas from './components/Canvas';
import { useState } from 'react';

function App() {
  const [selectedTool, setSelectedTool] = useState('pen');

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    console.log(`Selected tool: ${tool}`);
  };

  return (
    <div className="App">
      <div className="header">Collaborative Whiteboard</div>
      <Navbar onToolSelect={handleToolSelect} />
      <Canvas selectedTool={selectedTool} />
    </div>
  );
}

export default App;
