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
  const [editingText, setEditingText] = useState(null);
  const [editingTextIndex, setEditingTextIndex] = useState(null);
  const [selectedToolState, setSelectedTool] = useState(selectedTool);
  const [textDraftValue, setTextDraftValue] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
const [projectName, setProjectName] = useState("");
const [isSaving, setIsSaving] = useState(false);

  const stageRef = useRef(null);
  const textareaRef = useRef(null);
  const transformerRef = useRef(null);

  // Initialize socket connection
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

  // New effect for handling text editing
  useEffect(() => {
    if (editingText) {
      const textNode = stageRef.current.findOne('#' + editingText.id);
      if (textNode) {
        const textPosition = textNode.absolutePosition();
        const stageBox = stageRef.current.container().getBoundingClientRect();
        
        const textarea = textareaRef.current;
        textarea.style.display = 'block';
        textarea.style.position = 'absolute';
        textarea.style.top = `${stageBox.top + textPosition.y}px`;
        textarea.style.left = `${stageBox.left + textPosition.x}px`;
        textarea.style.width = `${textNode.width() - textNode.padding() * 2}px`;
        textarea.style.height = `${textNode.height() - textNode.padding() * 2}px`;
        textarea.style.fontSize = `${textNode.fontSize()}px`;
        textarea.style.border = '1px solid black';
        textarea.style.padding = '5px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'white';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.value = textNode.text();
        textarea.focus();
      }
    }
  }, [editingText]);

  const emitDrawData = (data) => {
    socket.current.emit('draw-data', data);
  };

  const handleMouseDown = (event) => {
    const pos = event.target.getStage().getPointerPosition();
    setIsDrawing(true);
    setStartPos(pos);

    let newData;
    if (selectedTool === 'pen' || selectedTool === 'eraser') {
      newData = { tool: selectedTool, points: [pos.x, pos.y], color, strokeWidth: brushSize };
      setLines([...lines, newData]);
    } else if (['rect', 'circle', 'line', 'triangle', 'arrow'].includes(selectedTool)) {
      newData = { tool: selectedTool, startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y, color, fillColor };
      setShapes([...shapes, newData]);
    } else if (selectedTool === 'text') {
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
      setEditingText(newText);
      newData = newText;
    } else if (selectedTool === 'comments') {
      const newComment = {
        id: `comment-${comments.length}`,
        x: pos.x,
        y: pos.y,
        text: '',
        width: 150,
        height: 100,
        color: color
      };
      setComments([...comments, newComment]);
      setEditingText(newComment);
      newData = newComment;
    }
    
    if (newData) {
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

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    if (tool === 'clear') {
      handleClearCanvas();
    }
  };

  const handleFeatureSelect = (feature) => {
    console.log('Selected feature:', feature);
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

  const handleTextChange = (e) => {
    const newText = e.target.value;
    if (editingText) {
      const updatedTexts = texts.map(t =>
        t.id === editingText.id ? { ...t, text: newText } : t
      );
      setTexts(updatedTexts);
      emitDrawData({ ...editingText, text: newText, tool: 'text' });
    }
  };

  const handleTextareaBlur = () => {
    const textarea = textareaRef.current;
    textarea.style.display = 'none';
    setEditingText(null);
    setSelectedId(null);
  };

  // const handleSave = () => {
  //   if (!projectName.trim()) {
  //     alert('Please enter a project name');
  //     return;
  //   }
    
  //   const canvasData = {
  //     projectName,
  //     lines,
  //     shapes,
  //     texts,
  //   };
  //   const jsonData = JSON.stringify(canvasData);
  
  //   // Send jsonData to the server
  //   saveToServer(jsonData);
  // };

  // const saveToServer = async (jsonData) => {
  //   try {
  //     const response = await fetch('http://localhost:8080/save-canvas', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ canvasData: jsonData }),
  //     });
  
  //     if (response.ok) {
  //       console.log('Canvas saved successfully');
  //     } else {
  //       console.error('Failed to save canvas');
  //     }
  //   } catch (error) {
  //     console.error('Error saving canvas:', error);
  //   }
  // };
  const handleSaveClick = () => {
    setIsSaveModalOpen(true);
  };
  const handleProjectNameChange = (e) => {
    setProjectName(e.target.value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();


  
    // Prevent submitting if project name is empty
    if (!projectName) {
      alert("Project name is required!");
      return;
    }
  
    setIsSaving(true); // Show loading indicator
  
    // Capture the canvas data
    const canvasData = {
      lines: lines,
      shapes: shapes,
      texts: texts,
    };
  
    // Save the project
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

  
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <div style={{ display: 'flex', gap: '15px', padding: '7px 15px', backgroundColor: '#f0f0f0', borderRadius: '10px', boxShadow: '2px 4px 10px rgba(0, 0, 0, 0.2)', marginBottom: '20px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', marginBottom: '4px' }}>Color</span>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ cursor: 'pointer', border: '2px solid transparent', borderRadius: '5px', padding: '5px', transition: 'border 0.3s' }} onMouseEnter={(e) => e.target.style.border = '2px solid black'} onMouseLeave={(e) => e.target.style.border = '2px solid transparent'} />
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
        <button onClick={handleSaveClick} style={{
  padding: '8px 5px',
  borderRadius: '10px',
  backgroundColor: 'green',
  color: '#fff',
  fontWeight: 'bold',
  cursor: 'pointer',
  border: 'none',
}}>
  Save
</button>
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
    <button onClick={() => setIsSaveModalOpen(false)}>Close</button>
  </div>
)}


      </div>

      <Stage
        width={window.innerWidth * 0.8}
        height={window.innerHeight * 0.8}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={(e) => {
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty) {
            setSelectedId(null);
            setEditingText(null);
          }
        }}
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
              text={text.text || 'Click to edit'}
              fontSize={text.fontSize}
              fill={text.color}
              width={text.width}
              height={text.height}
              padding={text.padding}
              draggable={true}
              onClick={() => {
                setSelectedId(text.id);
                setEditingText(text);
              }}
              onDblClick={() => {
                setEditingText(text);
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

          {comments.map((comment) => (
            <React.Fragment key={comment.id}>
              <Rect
                x={comment.x}
                y={comment.y}
                width={comment.width}
                height={comment.height}
                fill="yellow"
                stroke="black"
                cornerRadius={5}
              />
              <Text
                x={comment.x + 5}
                y={comment.y + 5}
                text={comment.text || 'Add comment here...'}
                width={comment.width - 10}
                height={comment.height - 10}
                fontSize={14}
                fill="black"
                onClick={() => setEditingText(comment)}
              />
            </React.Fragment>
          ))}

          {/* Transformer for text resizing */}
          {selectedId && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 20 || newBox.height < 20) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>

      {/* Textarea for editing text and comments */}
      <textarea
        ref={textareaRef}
        style={{
          display: 'none',
          position: 'absolute',
          border: '1px solid black',
          padding: '5px',
          overflow: 'hidden',
          resize: 'both',
          minHeight: '50px',
          minWidth: '100px',
          background: 'white'
        }}
        onChange={(e) => {
          if (editingText) {
            if (editingText.id.startsWith('text')) {
              const updatedTexts = texts.map(t =>
                t.id === editingText.id ? { ...t, text: e.target.value } : t
              );
              setTexts(updatedTexts);
            } else {
              const updatedComments = comments.map(c =>
                c.id === editingText.id ? { ...c, text: e.target.value } : c
              );
              setComments(updatedComments);
            }
          }
        }}
        onBlur={() => {
          textareaRef.current.style.display = 'none';
          setEditingText(null);
        }}
      />
    </div>
  );
}

export default Canvas;
