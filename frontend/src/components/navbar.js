import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  MoreVertical, 
  StickyNote, 
  FileText, 
  Save, 
  Pen, 
  Eraser, 
  Square, 
  Circle, 
  Triangle, 
  Minus, 
  Type, 
  Trash2, 
  MessageCircle,
  ArrowRight,
  LogIn,
  Palette,
  Zap
} from 'lucide-react';
import '../style/navbar.css';

const Navbar = ({ onToolSelect, onFeatureSelect }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [colorPicker, setColorPicker] = useState(false);
  const dropdownRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState('#007bff');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToolSelect = (tool) => {
    onToolSelect(tool);
    setActiveTool(tool);
  };

  const handleFeatureSelect = (feature) => {
    if (onFeatureSelect) {
      onFeatureSelect(feature);
    }
    setShowDropdown(false);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setColorPicker(false);
  };

  const colorPalette = [
    '#007bff', '#28a745', '#dc3545', '#ffc107', 
    '#6f42c1', '#17a2b8', '#343a40', '#000000'
  ];

  return (
    <div className="navbar">
      <div className="navbar-wrapper">
        <div className="dropdown-container">
          <button
            className="more-options tool-tooltip"
            onClick={() => setShowDropdown(!showDropdown)}
            data-tooltip="More Options"
          >
            <MoreVertical className="icon" />
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
          {[
            { tool: 'pen', icon: Pen, label: 'Pen' },
            { tool: 'eraser', icon: Eraser, label: 'Eraser' },
            { tool: 'rect', icon: Square, label: 'Rectangle' },
            { tool: 'circle', icon: Circle, label: 'Circle' },
            { tool: 'triangle', icon: Triangle, label: 'Triangle' },
            { tool: 'line', icon: Minus, label: 'Line' },
            { tool: 'arrow', icon: ArrowRight, label: 'Arrow' },
            { tool: 'text', icon: Type, label: 'Text' },
            { tool: 'clear', icon: Trash2, label: 'Clear' },
            { tool: 'sticky-note', icon: StickyNote, label: 'Sticky' },
            { tool: 'Chat', icon: MessageCircle, label: 'Chat' }
          ].map(({ tool, icon: Icon, label }) => (
            <button 
              key={tool}
              onClick={() => handleToolSelect(tool)} 
              className={`nav-item tool-tooltip ${activeTool === tool ? 'active' : ''}`}
              data-tooltip={label}
            >
              <Icon className="icon" />
            </button>
          ))}
          
          <div className="color-picker-container">
            <button 
              className="nav-item tool-tooltip color-picker-btn"
              onClick={() => setColorPicker(!colorPicker)}
              style={{ backgroundColor: selectedColor }}
              data-tooltip="Color Picker"
            >
              <Palette className="icon" />
            </button>
            {colorPicker && (
              <div className="color-palette">
                {colorPalette.map(color => (
                  <button
                    key={color}
                    className="color-option"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        
      </div>
    </div>
  );
};

export default Navbar;