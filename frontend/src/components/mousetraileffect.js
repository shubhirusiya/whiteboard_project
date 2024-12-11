import React, { useRef, useEffect, useState } from "react";

const LineTrail = () => {
  const canvasRef = useRef(null);
  const [trail, setTrail] = useState([]);
  const trailTimeoutRef = useRef(null);

  const maxTrail = 30; // Maximum trail length
  const trailFadeTimeout = 500; // Time (in ms) to clear the trail after cursor stops

  const clearTrail = () => {
    setTrail([]); // Clear the trail
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      setTrail((prevTrail) => {
        const newTrail = [...prevTrail, { x, y }];
        return newTrail.slice(-maxTrail); // Keep only the latest points
      });

      if (trailTimeoutRef.current) {
        clearTimeout(trailTimeoutRef.current);
      }
      trailTimeoutRef.current = setTimeout(clearTrail, trailFadeTimeout);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
        ctx.lineWidth = 11; // Trail thickness
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
      style={{
        display: "block",
        cursor: "none",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: "none", // Ensure the canvas doesn't interfere with other elements
      }}
    />
  );
};

export default LineTrail;
