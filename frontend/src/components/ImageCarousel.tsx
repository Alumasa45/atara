import React, { useEffect, useState } from 'react';

type Props = { images: string[] };

export default function ImageCarousel({ images }: Props) {
  const [index, setIndex] = useState(0);

  // Auto-transition every 10 seconds
  useEffect(() => {
    if (!images || images.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 10000);

    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div
        style={{
          height: 400,
          backgroundColor: '#e0e0e0',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
        }}
      >
        Loading images...
      </div>
    );
  }

  const currentImage = images[index];

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: 400,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundImage: `url('${currentImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        transition: 'background-image 1s ease-in-out',
      }}
    >
      {/* Dark overlay for better readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          zIndex: 1,
        }}
      />

      {/* Dot indicators */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 10,
          zIndex: 10,
        }}
      >
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor:
                idx === index ? 'white' : 'rgba(255, 255, 255, 0.6)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: idx === index ? '0 0 8px rgba(0,0,0,0.3)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          color: 'white',
          fontSize: 12,
          fontWeight: 'bold',
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          padding: '4px 12px',
          borderRadius: 4,
        }}
      >
        {index + 1} / {images.length}
      </div>

      {/* Auto-play indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          color: 'white',
          fontSize: 11,
          fontWeight: '600',
          zIndex: 10,
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          padding: '4px 12px',
          borderRadius: 4,
        }}
      >
        🎬 Auto-play (10s)
      </div>
    </section>
  );
}
