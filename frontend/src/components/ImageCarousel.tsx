import React from 'react';

type Props = { images?: string[] };

export default function ImageCarousel({ images }: Props) {
  return (
    <div
      style={{
        width: '100%',
        height: 400,
        backgroundColor: '#F5F0E8',
        borderRadius: 8,
      }}
    />
  );
}