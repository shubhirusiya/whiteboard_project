import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Arrow, Text, Transformer } from 'react-konva';
import { io } from 'socket.io-client';
import Navbar from './navbar';

function Canvas({ selectedTool }) {
  const [lines, setLines] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [texts, setTexts] = useState([]);
  const [stickyNotes, setStickyNotes] = useState([]);
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

useEffect(() => {
    if (selectedText && 'backgroundColor' in selectedText) {
      const handleKeyDown = (e) => {
        const newStickyNotes = [...stickyNotes];
        const noteIndex = newStickyNotes.findIndex(note => note.id === selectedText.id);
        
        if (noteIndex === -1) return;

        if (e.key === 'Backspace') {
          newStickyNotes[noteIndex].text = newStickyNotes[noteIndex].text.slice(0, -1);
        } else if (e.key.length === 1) {
          newStickyNotes[noteIndex].text += e.key;
        } else if (e.key === 'Enter') {
          newStickyNotes[noteIndex].text += '\n';
        }

        setStickyNotes(newStickyNotes);
        emitDrawData({
          ...newStickyNotes[noteIndex],
          tool: 'sticky-note'
        });
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedText, stickyNotes]);
  const emitDrawData = (data) => {
    socket.current.emit('draw-data', data);
  };

  const handleMouseDown = (event) => {
    const pos = event.target.getStage().getPointerPosition();
    setIsDrawing(true);
    setStartPos(pos);

     // Sticky Note creation
     if (selectedTool === 'sticky-note') {
      const newStickyNote = {
        id: `sticky-note-${stickyNotes.length}`,
        x: pos.x,
        y: pos.y,
        text: '',
        width: 150,
        height: 159,
        fontSize: 17,
        draggable: true,
        color: color || '#FFFF88', // Default to yellow sticky note
        backgroundColor: color || '#FFFF88'
      };
      setStickyNotes(prevNotes => [...prevNotes, newStickyNote]);
      
      setSelectedId(newStickyNote.id);
      setSelectedText(newStickyNote);
      emitDrawData({
        ...newStickyNote,
        tool: 'sticky-note'
      });
    }



    

    else if (selectedTool === 'text') {
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
      const newData = { 
        tool: selectedTool, 
        points: [pos.x, pos.y], 
        color: selectedTool === 'eraser' ? 'white' : color, 
        strokeWidth: selectedTool === 'eraser' ? 10 : brushSize // Optional: make eraser wider
      };
      
      setLines([...lines, newData]);
      emitDrawData(newData);
    }
      
     else if (['rect', 'circle', 'line', 'triangle', 'arrow'].includes(selectedTool)) {
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
    setStickyNotes([]);
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
    setStickyNotes([]); // Reset sticky notes
    setComments([]);
    setProjectName("");
    setSelectedId(null);
    setSelectedText(null);
  };



  useEffect(() => {
    if (selectedText && 'backgroundColor' in selectedText) {
      const handleKeyDown = (e) => {
        const newStickyNotes = [...stickyNotes];
        const noteIndex = newStickyNotes.findIndex(note => note.id === selectedText.id);
        
        if (noteIndex === -1) return;

        if (e.key === 'Backspace') {
          newStickyNotes[noteIndex].text = newStickyNotes[noteIndex].text.slice(0, -1);
        } else if (e.key.length === 1) {
          newStickyNotes[noteIndex].text += e.key;
        } else if (e.key === 'Enter') {
          newStickyNotes[noteIndex].text += '\n';
        }

        setStickyNotes(newStickyNotes);
        emitDrawData({
          ...newStickyNotes[noteIndex],
          tool: 'sticky-note'
        });
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedText, stickyNotes]);

  // Handle color change for selected sticky note
  const handleColorChange = (newColor) => {
    if (selectedText && 'backgroundColor' in selectedText) {
      const updatedStickyNotes = stickyNotes.map(note => 
        note.id === selectedText.id 
          ? { ...note, backgroundColor: newColor, color: newColor } 
          : note
      );
      
      setStickyNotes(updatedStickyNotes);
      
      // Update the selected note
      const updatedNote = updatedStickyNotes.find(note => note.id === selectedText.id);
      setSelectedText(updatedNote);
      
      // Emit to socket
      emitDrawData({
        ...updatedNote,
        tool: 'sticky-note'
      });
    }
  };


  const handleOpenClick = async () => {
    const projectToLoad = prompt("Enter the project name to open:");
    if (!projectToLoad) return;

    try {
        const response = await fetch(`http://localhost:8080/get-canvas/${projectToLoad}`);
        if (response.ok) {
            const canvasData = await response.json();
            // Update the state with the loaded canvas data
            setLines(canvasData.lines);
            setShapes(canvasData.shapes);
            setTexts(canvasData.texts);
            setStickyNotes(canvasData.stickyNotes || []); // handle case if stickyNotes is not present
            alert("Project loaded successfully!");
        } else {
            alert("Failed to load the project. Ensure the name is correct.");
        }
    } catch (error) {
        console.error("Error loading project:", error);
        alert("Error loading project");
    }
};

  



  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px',backgroundColor:'#f0f0f0',padding: '20px', 
      borderRadius: '15px' }}>
      <div style={{ display: 'flex', gap: '15px', padding: '7px 15px', backgroundColor: '#f0f0f0', borderRadius: '10px', boxShadow: '2px 4px 10px rgba(0, 0, 0, 0.2)', marginBottom: '20px' }}>
        {/* Your existing toolbar buttons */}
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', marginBottom: '4px' }}>Color</span>
          <input type="color" value={color} onChange={(e) => 
          {setColor(e.target.value);
            if (selectedText && 'backgroundColor' in selectedText) {
              handleColorChange(e.target.value);
            }
          }} 
          
           style={{ cursor: 'pointer', border: '2px solid transparent', borderRadius: '5px', padding: '5px', transition: 'border 0.3s' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', marginBottom: '4px' }}>Brush Size</span>
          <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} style={{ cursor: 'pointer' }} />
        </label>
        <button onClick={handleNewProject} className="toolbar-button new-project-btn">
  New Project
</button>
<button onClick={handleClearCanvas} className="toolbar-button clear-canvas-btn">
  Clear Canvas
</button>
<button onClick={handleUndo} className="toolbar-button undo-btn">
  Undo
</button>
<button onClick={handleSaveClick} className="toolbar-button save-btn">
  Save
</button>
<button onClick={handleOpenClick} className="toolbar-button open-btn">
  Open
</button>
        
      </div>





{/* Add this to the existing style block or create a new one */}
<style jsx>{`
  .canvas-toolbar {
    display: flex;
    gap: 15px;
    padding: 10px 20px;
    background: linear-gradient(145deg, #f0f0f0, #e6e6e6);
    border-radius: 15px;
    box-shadow: 
      6px 6px 12px rgba(0, 0, 0, 0.1), 
      -6px -6px 12px rgba(255, 255, 255, 0.9);
    margin-bottom: 20px;
    transition: all 0.3s ease;
  }

  .canvas-toolbar:hover {
    box-shadow: 
      8px 8px 16px rgba(0, 0, 0, 0.15), 
      -8px -8px 16px rgba(255, 255, 255, 0.95);
  }

  .toolbar-button {
    position: relative;
    padding: 8px 15px;
    border: none;
    border-radius: 10px;
    color: #fff;
    font-weight: bold;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    background: linear-gradient(45deg, #4a4a4a, #6a6a6a);
    box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .toolbar-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: all 0.3s ease;
  }

  .toolbar-button:hover::before {
    left: 100%;
  }

  .toolbar-button:hover {
    transform: scale(1.05);
    box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.3);
  }

  .new-project-btn {
    background: linear-gradient(45deg, #FF5C5C, #FF7F7F);
  }

  .clear-canvas-btn {
    background: linear-gradient(45deg, #808080, #A0A0A0);
  }

  .undo-btn {
    background: linear-gradient(45deg, #4169E1, #6495ED);
  }

  .save-btn {
    background: linear-gradient(45deg, #4CAF50, #81C784);
  }

  .open-btn {
    background: linear-gradient(45deg, #2196F3, #64B5F6);
  }

  .color-picker {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .color-picker-label {
    font-size: 14px;
    margin-bottom: 6px;
    color: #333;
    font-weight: 500;
  }

  .color-picker input[type="color"] {
    -webkit-appearance: none;
    border: none;
    width: 40px;
    height: 40px;
    cursor: pointer;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease;
  }

  .color-picker input[type="color"]:hover {
    transform: scale(1.1);
  }

  .color-picker input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-picker input[type="color"]::-webkit-color-swatch {
    border: none;
  }

  .brush-size-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .brush-size-label {
    font-size: 14px;
    margin-bottom: 6px;
    color: #333;
    font-weight: 500;
  }

  .brush-size-input {
    width: 100px;
    accent-color: #4169E1;
    cursor: pointer;
  }
`}</style>






      <Stage
        width={window.innerWidth * 0.8}
        height={window.innerHeight * 0.8}
        ref={stageRef}
        style={{
          backgroundColor: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
          borderRadius: '10px', // Optional: rounded corners for the canvas
          border: '1px solid #e0e0e0' // Optional: subtle border
        }}

        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {          
          if (selectedTool !== 'sticky-note') {
            handleMouseMove(e);
          }
        }}


        onMouseUp={handleMouseUp}
        onClick={(e) => {
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty) {
            setSelectedId(null);
            setSelectedText(null);
          }
        }}
        
      >
        <Layer>
        <Rect 
  x={0} 
  y={0} 
  width={window.innerWidth} 
  height={window.innerHeight} 
  fill="white" 
  listening={false} 
  shadowColor="rgba(0,0,0,0.2)"
  shadowBlur={15}
  shadowOffsetX={5}
  shadowOffsetY={5}
/>


{stickyNotes.map((note) => (
            <React.Fragment key={note.id}>
              <Rect
                id={note.id}
                x={note.x}
                y={note.y}
                width={note.width}
                height={note.height}
                fill={note.backgroundColor}
                stroke="rgba(0,0,0,0.2)"
                shadowColor="rgba(0,0,0,0.2)"
                shadowBlur={10}
                shadowOffsetX={3}
                shadowOffsetY={3}
                draggable={true}
                onClick={() => {
                  setSelectedId(note.id);
                  setSelectedText(note);


                }}
                onDragEnd={(e) => {
                  const updatedNotes = stickyNotes.map(n => 
                    n.id === note.id 
                      ? { ...n, x: e.target.x(), y: e.target.y() } 
                      : n
                  );
                  setStickyNotes(updatedNotes);
                  emitDrawData({
                    ...note,
                    x: e.target.x(),
                    y: e.target.y(),
                    tool: 'sticky-note'
                  });
                }}


              />
              <Text
                x={note.x + 10}
                y={note.y + 10}
                width={note.width - 20}
                height={note.height - 20}
                text={note.text || 'Click to type'}
                fontSize={note.fontSize}
                fill="black"
                draggable={false}
                onClick={() => {
                  setSelectedId(note.id);
                  setSelectedText(note);
                }}
              />
            </React.Fragment>
          ))}


          {lines.map((line, index) => (
  <Line
    key={index}
    points={line.points}
    stroke={line.tool === 'eraser' ? 'white' : line.color} // Change stroke color for eraser
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