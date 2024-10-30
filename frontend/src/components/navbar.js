import React, { useState } from 'react';
import '../style/navbar.css';
import Signup from './signup';

const Navbar = ({ onToolSelect }) => {
  const [showSignup, setShowSignup] = useState(false);

  const toggleSignup = () => {
    setShowSignup(!showSignup);
  };

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
        <button className="nav-item sign-in" onClick={toggleSignup}>🔒 Sign In</button>
        {showSignup && <Signup onClose={toggleSignup} />}
      </div>
    </nav>
  );
};

export default Navbar;


