// src/components/Navbar.js
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, StickyNote, MessageCircle, MessageSquare } from 'lucide-react';
import '../style/navbar.css';

const Navbar = ({ onToolSelect, onFeatureSelect }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFeatureSelect = (feature) => {
    if (onFeatureSelect) {
      onFeatureSelect(feature);
    }
    setShowDropdown(false);
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
        <div className="dropdown-container" ref={dropdownRef}>
          <button 
            className="nav-item more-options" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <MoreVertical size={20} />
          </button>
          {showDropdown && (
            <div className="dropdown-menu">
              <button onClick={() => handleFeatureSelect('sticky-notes')} className="dropdown-item">
                <StickyNote size={18} />
                Sticky Notes
              </button>
              <button onClick={() => handleFeatureSelect('comments')} className="dropdown-item">
                <MessageCircle size={18} />
                Comments
              </button>
              <button onClick={() => handleFeatureSelect('chat')} className="dropdown-item">
                <MessageSquare size={18} />
                Chat
              </button>
            </div>
          )}
        </div>
        <Link to="/signup" className="nav-item sign-in">🔒 Sign In</Link>
      </div>
    </nav>
  );
};

export default Navbar;