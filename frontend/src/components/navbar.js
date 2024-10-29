import React from 'react';
import '../style/navbar.css';

const Navbar = ({ onToolSelect }) => {
  return (
    <nav className="navbar">
      <ul>
        <button onClick={() => onToolSelect('pen')} className="nav-item">🖊️ Pen</button>
        <button onClick={() => onToolSelect('paint')} className="nav-item">🎨 Paint</button>
        <button onClick={() => onToolSelect('eraser')} className="nav-item">🧽 Eraser</button>
        <button onClick={() => onToolSelect('rect')} className="nav-item">⬛ Rectangle</button>
        <button onClick={() => onToolSelect('circle')} className="nav-item">⭕ Circle</button>
        <button onClick={() => onToolSelect('clear')} className="nav-item">🗑️ Clear</button>
        <button onClick={() => onToolSelect('save')} className="nav-item">💾 Save</button>
      </ul>
    </nav>
  );
};

export default Navbar;
