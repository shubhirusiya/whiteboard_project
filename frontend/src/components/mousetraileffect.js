import React, { useRef, useEffect, useState } from "react";
// import "./LineTrail.css";

const LineTrail = () => {
  const canvasRef = useRef(null);
  const [trail, setTrail] = useState([]);
  const trailTimeoutRef = useRef(null);

  const maxTrail = 30; // Maximum trail length
  const trailFadeTimeout = 500; // Time (in ms) to clear the trail after cursor stops

  const clearTrail = () => {
    setTrail([]); // Clear the trail
  };

  const handleMouseMove = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Ensure the canvas exists before proceeding

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Add the new point to the trail
    setTrail((prevTrail) => {
      const newTrail = [...prevTrail, { x, y }];
      return newTrail.slice(-maxTrail); // Keep only the latest points
    });

    // Reset the timeout to clear the trail
    if (trailTimeoutRef.current) {
      clearTimeout(trailTimeoutRef.current);
    }
    trailTimeoutRef.current = setTimeout(clearTrail, trailFadeTimeout);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Ensure the canvas is available before using it

    const ctx = canvas.getContext("2d");

    const drawTrail = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (trail.length > 0) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);

        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }

        ctx.strokeStyle = "#aebbff"; // Trail color
        ctx.lineWidth = 7; // Trail thickness
        ctx.stroke();
      }
    };

    drawTrail();
  }, [trail]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseMove={handleMouseMove}
      style={{ display: "block", cursor: "none" }}
    />
  );
};

export default LineTrail;
