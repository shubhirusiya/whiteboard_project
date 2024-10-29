import React, { useState, useRef } from 'react';
import { Stage, Layer, Line, Rect, Circle } from 'react-konva';

function Canvas({ selectedTool }) {
  const [lines, setLines] = useState([]);
  const [shapes, setShapes] = useState([]); // Store shapes here
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('black');
  const [fillColor, setFillColor] = useState(''); // Fill color state
  const [brushSize, setBrushSize] = useState(5);
  const [startPos, setStartPos] = useState(null); // Track starting position for shapes
  const stageRef = useRef(null);

  const handleMouseDown = (event) => {
    const pos = event.target.getStage().getPointerPosition();
    setIsDrawing(true);
    setStartPos(pos);

    if (selectedTool === 'pen' || selectedTool === 'eraser') {
      setLines([...lines, { tool: selectedTool, points: [pos.x, pos.y], color, strokeWidth: brushSize }]);
    } else if (selectedTool === 'rect' || selectedTool === 'circle') {
      setShapes([...shapes, { tool: selectedTool, startX: pos.x, startY: pos.y, width: 0, height: 0, color, fillColor }]);
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
    } else if (selectedTool === 'rect' || selectedTool === 'circle') {
      const newShapes = [...shapes];
      const lastShape = newShapes[newShapes.length - 1];
      lastShape.width = point.x - startPos.x;
      lastShape.height = point.y - startPos.y;
      setShapes(newShapes);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    setLines([]);
    setShapes([]);
  };

  const handleUndo = () => {
    if (selectedTool === 'pen' || selectedTool === 'eraser') {
      setLines(lines.slice(0, -1));
    } else {
      setShapes(shapes.slice(0, -1));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Controls for color, brush size, fill color, clear, and undo */}
      <div style={{ marginBottom: '10px' }}>
        <label>
          Color:
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
        <label style={{ marginLeft: '10px' }}>
          Fill Color:
          <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} />
        </label>
        <label style={{ marginLeft: '10px' }}>
          Brush Size:
          <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} />
        </label>
        <button onClick={handleClearCanvas} style={{ marginLeft: '10px' }}>Clear Canvas</button>
        <button onClick={handleUndo} style={{ marginLeft: '10px' }}>Undo</button>
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
          {/* Background rectangle to set the canvas color to grey */}
          <Rect x={0} y={0} width={window.innerWidth} height={window.innerHeight} fill="lightgrey" listening={false} />

          {/* Draw lines */}
          {lines.map((line, index) => (
            <Line
              key={index}
              points={line.points}
              stroke={line.tool === 'eraser' ? 'white' : line.color}
              strokeWidth={line.tool === 'eraser' ? 20 : line.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
            />
          ))}

          {/* Draw shapes */}
          {shapes.map((shape, index) => {
            if (shape.tool === 'rect') {
              return (
                <Rect
                  key={index}
                  x={shape.startX}
                  y={shape.startY}
                  width={shape.width}
                  height={shape.height}
                  stroke={shape.color}
                  fill={shape.fillColor || 'transparent'}
                  strokeWidth={2}
                />
              );
            } else if (shape.tool === 'circle') {
              const radius = Math.sqrt(shape.width ** 2 + shape.height ** 2);
              return (
                <Circle
                  key={index}
                  x={shape.startX}
                  y={shape.startY}
                  radius={radius}
                  stroke={shape.color}
                  fill={shape.fillColor || 'transparent'}
                  strokeWidth={2}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
}

export default Canvas;
