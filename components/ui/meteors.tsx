/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import { useEffect, useState } from 'react'

type Meteor = {
  id: number
  top: number
  left: number
  delay: number
  duration: number
  length: number
  angle: number
  distance: number
  startEdge: 'top' | 'left' | 'right'
}

export function Meteors({ count = 6 }: { count?: number }) {
  const [meteors, setMeteors] = useState<Meteor[]>([])
  
  useEffect(() => {
    const newMeteors = Array.from({ length: count }).map((_, i) => {
      // Randomly choose which edge the meteor starts from
      const edges: ('top' | 'left' | 'right')[] = ['top', 'left', 'right']
      const startEdge = edges[Math.floor(Math.random() * edges.length)]
      
      let top, left, angle
      
      // Set position and angle based on starting edge
      if (startEdge === 'top') {
        // Start from top edge, move downward at angles
        top = -5 + Math.random() * 10 // slightly above viewport
        left = Math.random() * 100
        angle = 30 + Math.random() * 120 // angles between 30-150 degrees (mostly downward)
      } else if (startEdge === 'left') {
        // Start from left edge, move right-ish
        top = Math.random() * 100
        left = -5 + Math.random() * 10 // slightly left of viewport
        angle = -60 + Math.random() * 120 // angles between -60 to 60 degrees
      } else {
        // Start from right edge, move left-ish and down
        top = Math.random() * 100
        left = 90 + Math.random() * 10 // slightly right of viewport
        angle = 120 + Math.random() * 120 // angles between 120-240 degrees
      }
      
      return {
        id: i,
        top,
        left,
        delay: Math.random() * 25,     // very spread out delays
        duration: 4 + Math.random() * 5, // varied speed: 4-9 seconds
        length: 30 + Math.random() * 60, // varied lengths: 30-90px
        angle: angle,
        distance: 400 + Math.random() * 300, // varied travel distance: 400-700px
        startEdge,
      }
    })
    setMeteors(newMeteors)
  }, [count])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className="absolute h-[0.5px] opacity-0"
          style={{
            top: `${meteor.top}%`,
            left: `${meteor.left}%`,
            width: `${meteor.length}px`,
            background: `linear-gradient(to left, rgba(255,255,255,0.9), rgba(255,255,255,0.6), transparent)`,
            animationDelay: `${meteor.delay}s`,
            animationDuration: `${meteor.duration}s`,
            animationName: `meteor-${meteor.id}`,
            animationTimingFunction: 'ease-out',
            animationIterationCount: 'infinite',
          }}
        >
          <style jsx>{`
            @keyframes meteor-${meteor.id} {
              0% {
                opacity: 0;
                transform: translateX(0) translateY(0) rotate(${meteor.angle}deg);
              }
              10% {
                opacity: 1;
              }
              90% {
                opacity: 0.8;
              }
              100% {
                opacity: 0;
                transform: translateX(${Math.cos((meteor.angle * Math.PI) / 180) * meteor.distance}px) 
                           translateY(${Math.sin((meteor.angle * Math.PI) / 180) * meteor.distance}px) 
                           rotate(${meteor.angle}deg);
              }
            }
          `}</style>
        </span>
      ))}
    </div>
  )
}