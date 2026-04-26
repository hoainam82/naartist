import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

interface DrawingCanvasProps {
  onDrawingChange: (dataUrl: string) => void;
  color: string;
  lineWidth: number;
  tool: 'pen' | 'fill' | 'square' | 'rectangle' | 'triangle';
  zoom: number;
}

export interface DrawingCanvasHandle {
  clearCanvas: () => void;
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(({ onDrawingChange, color, lineWidth, tool, zoom }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onDrawingChange(canvas.toDataURL());
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (tool === 'fill') {
      floodFill(ctx, x, y, color);
      onDrawingChange(canvas.toDataURL());
      return;
    }

    setIsDrawing(true);
    setStartPos({ x, y });

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (tool === 'square' || tool === 'rectangle') {
      const width = x - startPos.x;
      const height = tool === 'square' ? width : y - startPos.y;
      ctx.strokeRect(startPos.x, startPos.y, width, height);
    } else if (tool === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(startPos.x + (x - startPos.x) / 2, startPos.y);
      ctx.lineTo(startPos.x, y);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.stroke();
    }

    onDrawingChange(canvas.toDataURL());
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== 'pen') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const floodFill = (ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) => {
    // Simplified flood fill implementation
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;
    const startPos = (Math.floor(y) * ctx.canvas.width + Math.floor(x)) * 4;
    const startColor = [data[startPos], data[startPos + 1], data[startPos + 2], data[startPos + 3]];
    
    // Convert hex to rgb
    const r = parseInt(fillColor.slice(1, 3), 16);
    const g = parseInt(fillColor.slice(3, 5), 16);
    const b = parseInt(fillColor.slice(5, 7), 16);

    const stack = [[Math.floor(x), Math.floor(y)]];
    while (stack.length) {
      const [currX, currY] = stack.pop()!;
      const pos = (currY * ctx.canvas.width + currX) * 4;
      
      if (data[pos] === startColor[0] && data[pos + 1] === startColor[1] && data[pos + 2] === startColor[2] && data[pos + 3] === startColor[3]) {
        data[pos] = r;
        data[pos + 1] = g;
        data[pos + 2] = b;
        data[pos + 3] = 255;
        
        if (currX > 0) stack.push([currX - 1, currY]);
        if (currX < ctx.canvas.width - 1) stack.push([currX + 1, currY]);
        if (currY > 0) stack.push([currX, currY - 1]);
        if (currY < ctx.canvas.height - 1) stack.push([currX, currY + 1]);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  return (
    <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="border border-gray-300 bg-white cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
});
