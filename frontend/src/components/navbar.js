// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../style/navbar.css';

const Navbar = ({ onToolSelect }) => {
  return (
    <nav className="navbar">
      <div className="toolbar">
        <button onClick={() => onToolSelect('pen')} className="nav-item">🖊️ Pen</button>
        <button onClick={() => onToolSelect('eraser')} className="nav-item">🧽 Eraser</button>
        <button onClick={() => onToolSelect('rect')} className="nav-item">⬛ Rectangle</button>
        <button onClick={() => onToolSelect('circle')} className="nav-item">⭕ Circle</button>
        <button onClick={() => onToolSelect('triangle')} className="nav-item">🔺 Triangle</button>
        <button onClick={() => onToolSelect('line')} className="nav-item">📏 Line</button>
        <button onClick={() => onToolSelect('arrow')} className="nav-item">➡️ Arrow</button>
        <button onClick={() => onToolSelect('text')} className="nav-item">🅰️ Text</button>
        <button onClick={() => onToolSelect('clear')} className="nav-item">🗑️ Clear</button>
        <button onClick={() => onToolSelect('save')} className="nav-item">💾 Save</button>
      </div>
      <div className="actions">
        {/* Link to Signup Page */}
        <Link to="/signup" className="nav-item sign-in">🔒 Sign In</Link>
      </div>
    </nav>
  );
};

export default Navbar;
