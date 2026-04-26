/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { DrawingCanvas, DrawingCanvasHandle } from './components/DrawingCanvas';
import { enhanceImage } from './services/geminiService';

export default function App() {
  const [drawing, setDrawing] = useState<string>('');
  const [enhanced, setEnhanced] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [prompt, setPrompt] = useState('');
  const [tool, setTool] = useState<'pen' | 'fill' | 'square' | 'rectangle' | 'triangle'>('pen');
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<DrawingCanvasHandle>(null);

  const handleEnhance = async () => {
    if (!drawing) return;
    setLoading(true);
    try {
      const result = await enhanceImage(drawing, prompt);
      setEnhanced(result);
    } catch (error) {
      console.error(error);
      alert("Lỗi khi nâng cấp tranh.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
    setDrawing('');
    setEnhanced('');
  };

  const handleSave = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">AI Art Enhancer</h1>
      <div className="flex gap-4 mb-4 flex-wrap">
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} title="Chọn màu" />
        <input type="range" min="1" max="20" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} title="Độ đậm bút" />
        <select value={tool} onChange={(e) => setTool(e.target.value as any)} className="border p-2">
          <option value="pen">Bút vẽ</option>
          <option value="fill">Đổ màu</option>
          <option value="square">Hình vuông</option>
          <option value="rectangle">Hình chữ nhật</option>
          <option value="triangle">Hình tam giác</option>
        </select>
        <input type="range" min="0.5" max="2" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} title="Phóng to/Thu nhỏ" />
        <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Nhập ý tưởng của bạn..." className="border p-2" />
        <button onClick={handleClear} className="bg-red-500 text-white px-4 py-2 rounded">Xóa</button>
      </div>
      <div className="flex gap-4">
        <div className="overflow-auto border" style={{ width: 500, height: 500 }}>
          <DrawingCanvas ref={canvasRef} onDrawingChange={setDrawing} color={color} lineWidth={lineWidth} tool={tool} zoom={zoom} />
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleEnhance}
            disabled={loading || !drawing}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {loading ? 'Đang nâng cấp...' : 'Enhance'}
          </button>
          {drawing && <button onClick={() => handleSave(drawing, 'drawing.png')} className="bg-green-500 text-white px-4 py-2 rounded">Lưu tranh vẽ</button>}
          {enhanced && <button onClick={() => handleSave(enhanced, 'enhanced.png')} className="bg-green-500 text-white px-4 py-2 rounded">Lưu tranh nâng cấp</button>}
          {enhanced && <img src={enhanced} alt="Enhanced" className="w-[500px] h-[500px] border" />}
        </div>
      </div>
    </div>
  );
}
