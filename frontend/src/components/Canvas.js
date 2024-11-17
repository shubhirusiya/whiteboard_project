import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Arrow, Text, Transformer } from 'react-konva';
import { io } from 'socket.io-client';
import Navbar from './navbar';

function Canvas({ selectedTool }) {
  const [lines, setLines] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [texts, setTexts] = useState([]);
  const [comments, setComments] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('black');
  const [fillColor, setFillColor] = useState('');
  const [brushSize, setBrushSize] = useState(5);
  const [startPos, setStartPos] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [selectedToolState, setSelectedTool] = useState(selectedTool);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io('http://localhost:8080');

    socket.current.on('draw-data', (data) => {
      if (data.tool === 'pen' || data.tool === 'eraser') {
        setLines((prevLines) => [...prevLines, data]);
      }
      else if (['rect', 'circle', 'line', 'triangle', 'arrow'].includes(data.tool)) {
        setShapes((prevShapes) => [...prevShapes, data]);
      } else if (data.tool === 'text') {
        setTexts((prevTexts) => [...prevTexts, data]);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedId) {
      transformerRef.current.nodes([stageRef.current.findOne('#' + selectedId)]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  // Handle keyboard events for text editing
  useEffect(() => {
    if (selectedText) {
      const handleKeyDown = (e) => {
        if (!selectedText) return;

        const newText = [...texts];
        const textIndex = newText.findIndex(t => t.id === selectedText.id);
        
        if (textIndex === -1) return;

        if (e.key === 'Backspace') {
          newText[textIndex].text = newText[textIndex].text.slice(0, -1);
        } else if (e.key.length === 1) {
          newText[textIndex].text += e.key;
        } else if (e.key === 'Enter') {
          newText[textIndex].text += '\n';
        }

        setTexts(newText);
        emitDrawData({
          ...newText[textIndex],
          tool: 'text'
        });
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedText]);

  const emitDrawData = (data) => {
    socket.current.emit('draw-data', data);
  };

  const handleMouseDown = (event) => {
    const pos = event.target.getStage().getPointerPosition();
    setIsDrawing(true);
    setStartPos(pos);

    if (selectedTool === 'text') {
      const newText = {
        id: `text-${texts.length}`,
        x: pos.x,
        y: pos.y,
        text: '',
        fontSize: 16,
        width: 200,
        height: 50,
        draggable: true,
        color: color,
        padding: 5
      };
      setTexts([...texts, newText]);
      setSelectedId(newText.id);
      setSelectedText(newText);
      emitDrawData({
        ...newText,
        tool: 'text'
      });
    } else if (selectedTool === 'pen' || selectedTool === 'eraser') {
      const newData = { tool: selectedTool, points: [pos.x, pos.y], color, strokeWidth: brushSize };
      setLines([...lines, newData]);
      emitDrawData(newData);
    } else if (['rect', 'circle', 'line', 'triangle', 'arrow'].includes(selectedTool)) {
      const newData = { tool: selectedTool, startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y, color, fillColor };
      setShapes([...shapes, newData]);
      emitDrawData(newData);
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
      emitDrawData(lastLine);
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
    if (['rect', 'circle', 'line', 'triangle', 'arrow'].includes(selectedTool)) {
      const lastShape = shapes[shapes.length - 1];
      emitDrawData(lastShape);
    }
  };

  const handleStageClick = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
      setSelectedText(null);
    }
  };

  // Your existing functions remain the same
  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    if (tool === 'clear') {
      handleClearCanvas();
    }
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

  const handleSaveClick = () => {
    setIsSaveModalOpen(true);
  };

  const handleProjectNameChange = (e) => {
    setProjectName(e.target.value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!projectName) {
      alert("Project name is required!");
      return;
    }
    setIsSaving(true);
    const canvasData = {
      lines: lines,
      shapes: shapes,
      texts: texts,
    };
    await saveToServer(projectName, canvasData);
  };

  const saveToServer = async (projectName, canvasData) => {
    try {
      const response = await fetch('http://localhost:8080/save-canvas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: projectName,
          canvasData: canvasData,
        }),
      });

      if (response.ok) {
        alert('Project saved successfully!');
        setIsSaveModalOpen(false);
      } else {
        alert('Failed to save the project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewProject = () => {
    setLines([]);
    setShapes([]);
    setTexts([]);
    setComments([]);
    setProjectName("");
    setSelectedId(null);
    setSelectedText(null);
  };

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <div style={{ display: 'flex', gap: '15px', padding: '7px 15px', backgroundColor: '#f0f0f0', borderRadius: '10px', boxShadow: '2px 4px 10px rgba(0, 0, 0, 0.2)', marginBottom: '20px' }}>
        {/* Your existing toolbar buttons */}
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', marginBottom: '4px' }}>Color</span>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ cursor: 'pointer', border: '2px solid transparent', borderRadius: '5px', padding: '5px', transition: 'border 0.3s' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', marginBottom: '4px' }}>Brush Size</span>
          <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} style={{ cursor: 'pointer' }} />
        </label>
        <button onClick={handleNewProject} style={{ padding: '8px 15px', borderRadius: '10px', backgroundColor: '#FF5C5C', color: '#fff', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>
          New Project
        </button>
        <button onClick={handleClearCanvas} style={{ padding: '8px 5px', borderRadius: '10px', backgroundColor: 'gray', color: '#fff', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>
          Clear Canvas
        </button>
        <button onClick={handleUndo} style={{ padding: '1px 7px 3px', borderRadius: '5px', backgroundColor: 'dodgerblue', color: '#fff', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>
          Undo
        </button>
        <button onClick={handleSaveClick} style={{ padding: '8px 5px', borderRadius: '10px', backgroundColor: 'green', color: '#fff', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>
          Save
        </button>
      </div>

      <Stage
        width={window.innerWidth * 0.8}
        height={window.innerHeight * 0.8}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleStageClick}
      >
        <Layer>
          <Rect 
            x={0} 
            y={0} 
            width={window.innerWidth} 
            height={window.innerHeight} 
            fill="lightgrey" 
            listening={false} 
          />

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

          {texts.map((text) => (
            <Text
              key={text.id}
              id={text.id}
              x={text.x}
              y={text.y}
              text={text.text || 'Click to type'}
              fontSize={text.fontSize}
              fill={text.color}
              width={text.width}
              height={text.height}
              padding={text.padding}
              draggable={true}
              onClick={() => {
                setSelectedId(text.id);
                setSelectedText(text);
              }}
              onTransform={(e) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                node.scaleX(1);
                node.scaleY(1);
                node.width(node.width() * scaleX);
                node.height(node.height() * scaleY);
              }}
            />
          ))}

          {selectedId && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                return newBox.width < 20 || newBox.height < 20 ? oldBox : newBox;
              }}
            />
          )}
        </Layer>
      </Stage>

      {isSaveModalOpen && (
        <div className="save-modal">
          <form onSubmit={handleFormSubmit}>
            <label>
              Project Name:
              <input
                type="text"
                value={projectName}
                onChange={handleProjectNameChange}
                required
              />
            </label>
            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Project"}
            </button>
          </form>
          <button 
            onClick={() => setIsSaveModalOpen(false)}
            style={{
              padding: '8px 15px',
              borderRadius: '5px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              marginTop: '10px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}

      <style jsx>{`
        .save-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          z-index: 1000;
        }

        .save-modal form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .save-modal label {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .save-modal input {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 14px;
        }

        .save-modal button[type="submit"] {
          padding: 8px 15px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        }

        .save-modal button[type="submit"]:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .save-modal button[type="submit"]:hover:not(:disabled) {
          background-color: #45a049;
        }
      `}</style>
    </div>
  );
}

export default Canvas;