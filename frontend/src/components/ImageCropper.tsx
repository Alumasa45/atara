import React, { useState, useRef, useCallback } from 'react';

interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCrop, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setCrop(prev => ({
      ...prev,
      x: Math.max(0, Math.min(300 - prev.width, e.clientX - dragStart.x)),
      y: Math.max(0, Math.min(300 - prev.height, e.clientY - dragStart.y)),
    }));
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = 200;
      canvas.height = 200;
      
      const scaleX = img.width / 300;
      const scaleY = img.height / 300;
      
      ctx.drawImage(
        img,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        200,
        200
      );

      canvas.toBlob((blob) => {
        if (blob) onCrop(blob);
      }, 'image/jpeg', 0.8);
    };
    img.src = imageSrc;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 8,
        maxWidth: 400,
        width: '90%',
      }}>
        <h3 style={{ marginBottom: 16 }}>Crop Profile Picture</h3>
        
        <div style={{
          position: 'relative',
          width: 300,
          height: 300,
          margin: '0 auto 16px',
          border: '1px solid #ddd',
          overflow: 'hidden',
        }}>
          <img
            src={imageSrc}
            alt="Crop preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: crop.x,
              top: crop.y,
              width: crop.width,
              height: crop.height,
              border: '2px solid #2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              cursor: 'move',
            }}
            onMouseDown={handleMouseDown}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={handleCrop}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ✓ Crop & Upload
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ✕ Cancel
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};