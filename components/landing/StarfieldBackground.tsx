'use client'
import React from 'react';

interface StarfieldBackgroundProps {
  starCount?: number;
  children?: React.ReactNode;
  className?: string;
}

const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({ 
  starCount = 150, 
  children,
  className = ''
}) => {
  // Generate random stars
  const generateStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
    }));
  };

  const stars = React.useMemo(() => generateStars(starCount), [starCount]);

  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Radial gradient overlay - lighter at top */}
      <div className="fixed top-0 left-0 right-0 h-[40vh] bg-[radial-gradient(ellipse_at_top_center,#1a2642_0%,#0a1120_40%,transparent_80%)] pointer-events-none z-0"></div>

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* Darker vignette edges */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_50%,#000000_100%)] pointer-events-none z-0"></div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default StarfieldBackground;
