import React, { useState, useRef } from 'react';
import { Stage, Layer, Line, Rect, Circle, Arrow, Text } from 'react-konva';
import Navbar from './navbar';

function Canvas({ selectedTool }) {
  const [lines, setLines] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [texts, setTexts] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('black');
  const [fillColor, setFillColor] = useState('');
  const [brushSize, setBrushSize] = useState(5);
  const [startPos, setStartPos] = useState(null);
  const [editingTextIndex, setEditingTextIndex] = useState(null);
  const stageRef = useRef(null);

  const handleMouseDown = (event) => {
    const pos = event.target.getStage().getPointerPosition();
    setIsDrawing(true);
    setStartPos(pos);

    if (selectedTool === 'pen' || selectedTool === 'eraser') {
      setLines([...lines, { tool: selectedTool, points: [pos.x, pos.y], color, strokeWidth: brushSize }]);
    } else if (['rect', 'circle', 'line', 'triangle', 'arrow'].includes(selectedTool)) {
      setShapes([...shapes, { tool: selectedTool, startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y, color, fillColor }]);
    } else if (selectedTool === 'text') {
      setTexts([...texts, { x: pos.x, y: pos.y, width: 100, height: 50, text: '', color, fontSize: 20 }]);
      setEditingTextIndex(texts.length);
    }
  };

  const handleMouseMove = (event) => {
    if (!isDrawing) return;
    const stage = event.target.getStage();
    const point = stage.getPointerPosition();

    if (selectedTool === 'pen' || selectedTool === 'eraser') {
      const lastLine = lines[lines.length - 1];
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      lines.splice(lines.length - 1, 1, lastLine);
      setLines([...lines]);
    } else if (['rect', 'circle', 'line', 'triangle', 'arrow'].includes(selectedTool)) {
      const newShapes = [...shapes];
      const lastShape = newShapes[newShapes.length - 1];
      lastShape.endX = point.x;
      lastShape.endY = point.y;
      setShapes(newShapes);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleTextChange = (e) => {
    if (editingTextIndex === null) return;
    const newTexts = texts.map((text, i) => i === editingTextIndex ? { ...text, text: e.target.value } : text);
    setTexts(newTexts);
  };

  const handleClearCanvas = () => {
    setLines([]);
    setShapes([]);
    setTexts([]);
  };

  const handleUndo = () => {
    if (selectedTool === 'pen' || selectedTool === 'eraser') {
      setLines(lines.slice(0, -1));
    } else {
      setShapes(shapes.slice(0, -1));
      setTexts(texts.slice(0, -1));
    }
  };

  return (
    
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <Navbar/>
      <br></br>
      <div style={{
        display: 'flex',
        gap: '15px',
        padding: '7px 15px',
        backgroundColor: '#f0f0f0',
        borderRadius: '10px',
        boxShadow: '2px 4px 10px rgba(0, 0, 0, 0.2)',
        marginBottom: '20px'
      }}>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', marginBottom: '4px' }}>Color</span>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ cursor: 'pointer', border: '2px solid transparent', borderRadius: '5px', padding: '5px', transition: 'border 0.3s' }} onMouseEnter={(e) => e.target.style.border = '2px solid black'} onMouseLeave={(e) => e.target.style.border = '2px solid transparent'} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', marginBottom: '4px' }}>Fill Color</span>
          <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} style={{ cursor: 'pointer', border: '2px solid transparent', borderRadius: '5px', padding: '5px', transition: 'border 0.3s' }} onMouseEnter={(e) => e.target.style.border = '2px solid black'} onMouseLeave={(e) => e.target.style.border = '2px solid transparent'} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', marginBottom: '4px' }}>Brush Size</span>
          <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} style={{ cursor: 'pointer' }} />
        </label>
        <button onClick={handleClearCanvas} style={{
          padding: '8px 5px',
          borderRadius: '10px',
          backgroundColor: 'gray',
          color: '#fff',
          fontWeight: 'bold',
          cursor: 'pointer',
          border: 'none',
          transition: 'background-color 0.3s',
        }} onMouseOver={(e) => e.target.style.backgroundColor = 'blue'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'dodgerblue'}>
          Clear Canvas
        </button>
        <button onClick={handleUndo} style={{
          padding: '1px 7px 3px',
          borderRadius: '5px',
          backgroundColor: 'dodgerblue',
          color: '#fff',
          fontWeight: 'bold',
          cursor: 'pointer',
          border: 'none',
          transition: 'background-color 0.3s',
        }} onMouseOver={(e) => e.target.style.backgroundColor = 'blue'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'dodgerblue'}>
          Undo
        </button>
      </div>

      <Stage
        width={window.innerWidth * 0.8}
        height={window.innerHeight * 0.8}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          <Rect x={0} y={0} width={window.innerWidth} height={window.innerHeight} fill="lightgrey" listening={false} />

          {lines.map((line, index) => (
            <Line
              key={index}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
            />
          ))}

          {shapes.map((shape, index) => {
            const { tool, startX, startY, endX, endY, color, fillColor } = shape;
            if (tool === 'rect') {
              return <Rect key={index} x={startX} y={startY} width={endX - startX} height={endY - startY} stroke={color} fill={fillColor} />;
            } else if (tool === 'circle') {
              const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
              return <Circle key={index} x={startX} y={startY} radius={radius} stroke={color} fill={fillColor} />;
            } else if (tool === 'line') {
              return <Line key={index} points={[startX, startY, endX, endY]} stroke={color} strokeWidth={brushSize} />;
            } else if (tool === 'triangle') {
              return (
                <Line
                  key={index}
                  points={[startX, startY, endX, startY, (startX + endX) / 2, endY]}
                  closed
                  stroke={color}
                  fill={fillColor}
                />
              );
            } else if (tool === 'arrow') {
              return <Arrow key={index} points={[startX, startY, endX, endY]} stroke={color} fill={color} />;
            }
            return null;
          })}

          {texts.map((text, index) => (
            <Text
              key={index}
              x={text.x}
              y={text.y}
              text={text.text || 'Enter Text'}
              fill={text.color}
              fontSize={text.fontSize}
              width={text.width}
              height={text.height}
              draggable
              onClick={() => setEditingTextIndex(index)}
            />
          ))}
        </Layer>
      </Stage>

      {editingTextIndex !== null && (
        <textarea
          style={{
            position: 'absolute',
            top: texts[editingTextIndex].y + 50,
            left: texts[editingTextIndex].x + 50,
            width: texts[editingTextIndex].width,
            height: texts[editingTextIndex].height,
            fontSize: texts[editingTextIndex].fontSize,
            color: texts[editingTextIndex].color,
            resize: 'none',
            border: '1px solid gray',
            background: 'white',
            padding: '5px'
          }}
          value={texts[editingTextIndex].text}
          onChange={handleTextChange}
          onBlur={() => setEditingTextIndex(null)}
          autoFocus
        />
      )}
    </div>
  );
}

export default Canvas;