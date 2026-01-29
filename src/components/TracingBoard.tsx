'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, RefreshCcw } from 'lucide-react';
import { MARATHI_LETTERS } from '@/lib/marathi-data';

interface TracingBoardProps {
  letter: string;
  phoneme: string;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  life: number;
}

const TOLERANCE = 12; // Slightly stricter but still kid-friendly
const STEP_PRECISION = 2.5; // Faster tracing response

const TracingBoard: React.FC<TracingBoardProps> = ({ letter, phoneme, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [strokeProgress, setStrokeProgress] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isError, setIsError] = useState(false);
  const particleIdRef = useRef(0);

  const letterData = useMemo(() => {
    const all = [...MARATHI_LETTERS.vowels, ...MARATHI_LETTERS.consonants];
    return all.find(l => l.char === letter);
  }, [letter]);

  const strokes = letterData?.strokes || [];

  useEffect(() => {
    setStrokeProgress(new Array(strokes.length).fill(0));
    setCurrentStrokeIndex(0);
    setShowSuccess(false);
    setIsError(false);
    speak();
  }, [letter, strokes.length]);

  const speak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(letter);
      utterance.lang = 'mr-IN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getRelativePos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100
    };
  };

  const addParticles = (x: number, y: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const screenX = (x / 100) * rect.width;
    const screenY = (y / 100) * rect.height;

    const newParticles: Particle[] = Array.from({ length: 3 }).map(() => ({
      id: particleIdRef.current++,
      x: screenX + (Math.random() - 0.5) * 30,
      y: screenY + (Math.random() - 0.5) * 30,
      size: Math.random() * 20 + 5,
      color: ['#FFD700', '#FFF', '#8BC34A', '#4FC3F7'][Math.floor(Math.random() * 4)],
      life: 1,
    }));
    setParticles(prev => [...prev.slice(-30), ...newParticles]);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getRelativePos(e);

    if (!isDrawing || showSuccess || currentStrokeIndex >= strokes.length) return;
    
    const path = pathRefs.current[currentStrokeIndex];
    if (!path) return;

    const totalLength = path.getTotalLength();
    const currentProgress = strokeProgress[currentStrokeIndex];
    
    const targetPoint = path.getPointAtLength(currentProgress);
    const dist = Math.sqrt(Math.pow(pos.x - targetPoint.x, 2) + Math.pow(pos.y - targetPoint.y, 2));

    if (dist < TOLERANCE) {
      setIsError(false);
      
      if (dist < TOLERANCE * 0.8) {
        let nextProgress = currentProgress + STEP_PRECISION;
        if (nextProgress > totalLength) {
          nextProgress = totalLength;
          const nextIndex = currentStrokeIndex + 1;
          if (nextIndex >= strokes.length) {
            setTimeout(() => {
              setShowSuccess(true);
              onComplete?.();
            }, 300);
          } else {
            setCurrentStrokeIndex(nextIndex);
          }
        }
        
        const newProgress = [...strokeProgress];
        newProgress[currentStrokeIndex] = nextProgress;
        setStrokeProgress(newProgress);
        addParticles(pos.x, pos.y);
      }
    } else {
      setIsError(true);
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (showSuccess) return;
    setIsDrawing(true);
    handleMove(e);
  };

  const handleEnd = () => {
    setIsDrawing(false);
    setIsError(false);
  };

  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({ ...p, life: p.life - 0.05, y: p.y - 1 }))
        .filter(p => p.life > 0)
      );
    }, 30);
    return () => clearInterval(interval);
  }, [particles]);

  const guidePoint = useMemo(() => {
    if (showSuccess || currentStrokeIndex >= strokes.length) return null;
    const path = pathRefs.current[currentStrokeIndex];
    if (!path) return null;
    return path.getPointAtLength(strokeProgress[currentStrokeIndex]);
  }, [currentStrokeIndex, strokeProgress, strokes.length, showSuccess]);

  return (
    <div 
      className="relative w-full h-full select-none touch-none bg-[#FDFDFD] rounded-[3rem] overflow-hidden" 
      ref={containerRef}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      {/* SVG Tracing Layer */}
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full p-2"
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#BBBBBB" />
          </marker>
        </defs>

        {/* Background Ghost Letter (Perfectly Aligned) */}
        <text
          x="50"
          y="58"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="75"
          fontWeight="bold"
          fill="none"
          stroke="#F0F0F0"
          strokeWidth="0.5"
          style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
        >
          {letter}
        </text>

        {/* Background Guide Paths */}
        {strokes.map((d, i) => (
          <g key={`stroke-bg-${i}`}>
            {/* Thick grey background for the stroke area */}
            <path
              d={d}
              fill="none"
              stroke="#F5F5F5"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dashed line with arrows */}
            <path
              d={d}
              fill="none"
              stroke="#CCCCCC"
              strokeWidth="2"
              strokeDasharray="1,6"
              strokeLinecap="round"
              markerEnd="url(#arrow)"
            />
          </g>
        ))}
    
        {/* Traced Progress */}
        {strokes.map((d, i) => {
          const isCompleted = i < currentStrokeIndex;
          const isCurrent = i === currentStrokeIndex;
          const length = pathRefs.current[i]?.getTotalLength() || 0;
          const progress = isCompleted ? length : (isCurrent ? strokeProgress[i] : 0);

          return (
            <g key={`stroke-group-${i}`}>
              <path
                ref={el => { pathRefs.current[i] = el; }}
                d={d}
                fill="none"
                stroke="transparent"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={d}
                fill="none"
                stroke={isError && isCurrent ? "#FF5252" : "#4CAF50"}
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={`${progress}, ${length}`}
              />
            </g>
          );
        })}

        {/* Starting Points (Numbered) */}
        {strokes.map((d, i) => {
          // Extract start point from 'M x,y'
          const match = d.match(/M\s*([\d.]+),([\d.]+)/);
          if (!match) return null;
          const [_, x, y] = match;
          const isActive = i === currentStrokeIndex;
          const isDone = i < currentStrokeIndex;

          return (
            <g key={`start-point-${i}`} className="pointer-events-none">
              <circle 
                cx={x} 
                cy={y} 
                r="3.5" 
                fill={isDone ? "#4CAF50" : (isActive ? "#8BC34A" : "#EEEEEE")} 
                stroke="white"
                strokeWidth="0.5"
              />
              <text
                x={x}
                y={parseFloat(y) + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="3.5"
                fontWeight="bold"
                fill={isDone || isActive ? "white" : "#999999"}
                style={{ fontFamily: "sans-serif" }}
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* Animated Guide (Star) */}
        {!isDrawing && guidePoint && !showSuccess && (
          <motion.g
            animate={{ x: guidePoint.x, y: guidePoint.y }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
             <motion.path 
                d="M 0,-5 L 1.2,-1.2 L 5,0 L 1.2,1.2 L 0,5 L -1.2,1.2 L -5,0 L -1.2,-1.2 Z" 
                fill="#FFD700"
                stroke="#FFA000"
                strokeWidth="0.5"
                animate={{ rotate: 360, scale: [1, 1.3, 1] }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                }}
             />
          </motion.g>
        )}
      </svg>


      {/* Particle Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute"
            style={{ 
              left: p.x, 
              top: p.y, 
              width: p.size, 
              height: p.size,
              opacity: p.life,
              color: p.color,
              transform: `scale(${p.life})`
            }}
          >
            <Star fill="currentColor" size={p.size} />
          </div>
        ))}
      </div>

      {/* Success View */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-green-500/90"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-white p-8 rounded-full shadow-2xl mb-8"
            >
              <Star size={100} fill="#FFD700" className="text-yellow-500" />
            </motion.div>
            
            <h3 className="text-6xl font-black text-white mb-8 italic">EXCELLENT!</h3>
            
            <button 
              onClick={() => {
                  setStrokeProgress(new Array(strokes.length).fill(0));
                  setCurrentStrokeIndex(0);
                  setShowSuccess(false);
              }}
              className="p-6 bg-white rounded-full text-green-600 shadow-xl hover:scale-110 transition-transform"
            >
              <RefreshCcw size={50} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Feedback */}
      <AnimatePresence>
        {isError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white px-8 py-3 rounded-full font-black shadow-lg pointer-events-none text-xl"
          >
            Follow the line! ✍️
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TracingBoard;
