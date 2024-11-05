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
  
  const stageRef = useRef(null);
  const textareaRef = useRef(null);
  const transformerRef = useRef(null);

  // Initialize socket connection
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io('http://localhost:8080'); // Adjust to your server URL

    // Listen for incoming drawing data
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

  // Add transformer effect
  useEffect(() => {
    if (selectedId) {
      transformerRef.current.nodes([stageRef.current.findOne('#' + selectedId)]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  const emitDrawData = (data) => {
    socket.current.emit('draw-data', data);
  };

  const handleTextEdit = (textNode) => {
    const textPosition = textNode.absolutePosition();
    const stageBox = stageRef.current.container().getBoundingClientRect();
    const areaPosition = {
      x: stageBox.left + textPosition.x,
      y: stageBox.top + textPosition.y,
    };

    const textarea = textareaRef.current;
    textarea.style.display = 'block';
    textarea.style.position = 'absolute';
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.width = `${textNode.width()}px`;
    textarea.style.height = `${textNode.height()}px`;
    textarea.value = textNode.text();
    textarea.focus();
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
        text: 'Type here...',
        fontSize: 16,
        width: 200,
        height: 50,
        draggable: true,
        color: color
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

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      {/* Toolbar setup */}
      <div style={{ display: 'flex', gap: '15px', padding: '7px 15px', backgroundColor: '#f0f0f0', borderRadius: '10px', boxShadow: '2px 4px 10px rgba(0, 0, 0, 0.2)', marginBottom: '20px' }}>
        {/* Color, FillColor, BrushSize, Clear, Undo Buttons */}
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

          {/* Render Lines */}
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

          {/* Render Shapes */}
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

          {/* Render Texts */}
          {texts.map((text) => (
            <Text
              key={text.id}
              id={text.id}
              x={text.x}
              y={text.y}
              text={text.text}
              fontSize={text.fontSize}
              fill={text.color}
              width={text.width}
              height={text.height}
              draggable={true}
              onClick={() => {
                setSelectedId(text.id);
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

          {/* Render Comments */}
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