import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, StickyNote, MessageCircle, MessageSquare, Save } from 'lucide-react';
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
    <div className="navbar">
      <div className="dropdown-container">
        <button
          className="more-options"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <MoreVertical />
        </button>
        {showDropdown && (
          <div className="dropdown-menu" ref={dropdownRef}>
            <button onClick={() => handleFeatureSelect('new')} className="dropdown-item">
              <StickyNote /> New
            </button>
            <button onClick={() => handleFeatureSelect('open')} className="dropdown-item">
              <MessageCircle /> Open
            </button>
            <button onClick={() => handleFeatureSelect('save')} className="dropdown-item">
              <Save /> Save
            </button>
          </div>
        )}
      </div>
      <div className="toolbar">
        <button onClick={() => onToolSelect('pen')} className="nav-item">🖊 Pen</button>
        <button onClick={() => onToolSelect('eraser')} className="nav-item">🧽 Eraser</button>
        <button onClick={() => onToolSelect('rect')} className="nav-item">⬛ Rectangle</button>
        <button onClick={() => onToolSelect('circle')} className="nav-item">⭕ Circle</button>
        <button onClick={() => onToolSelect('triangle')} className="nav-item">🔺 Triangle</button>
        <button onClick={() => onToolSelect('line')} className="nav-item">📏 Line</button>
        <button onClick={() => onToolSelect('arrow')} className="nav-item">➡ Arrow</button>
        <button onClick={() => onToolSelect('text')} className="nav-item">🅰 Text</button>
        <button onClick={() => onToolSelect('clear')} className="nav-item">🗑 Clear</button>
        <button onClick={() => onToolSelect('sticky-notes')} className="nav-item">📋 Sticky Notes</button>
        <button onClick={() => onToolSelect('comments')} className="nav-item">💬 Comments</button>
        <button onClick={() => onToolSelect('Chat')} className="nav-item">💾 Chat</button>
      </div>
      <Link to="/signup" className="nav-item sign-in">🔒 Sign In</Link>
      </div>
  
  );
};

export default Navbar;