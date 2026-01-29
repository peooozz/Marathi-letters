'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw, Volume2, ArrowLeft, ArrowRight } from 'lucide-react';
import TracingBoard from '@/components/TracingBoard';
import { MARATHI_LETTERS } from '@/lib/marathi-data';

type GameState = 'landing' | 'selection' | 'tracing';

export default function MarathiTracingPage() {
  const [gameState, setGameState] = useState<GameState>('landing');
  const [currentIndex, setCurrentIndex] = useState(0);

  const allLetters = useMemo(() => [...MARATHI_LETTERS.vowels, ...MARATHI_LETTERS.consonants], []);
  const currentLetter = allLetters[currentIndex];

  const handlePlay = () => {
    setGameState('selection');
  };

  const handleLetterSelect = (index: number) => {
    setCurrentIndex(index);
    setGameState('tracing');
  };

  const goBack = () => {
    if (gameState === 'tracing') setGameState('selection');
    else if (gameState === 'selection') setGameState('landing');
  };

  return (
    <div className="min-h-screen bg-[#87CEEB] overflow-hidden relative">
      {/* Background Layer: Forest */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#87CEEB] to-[#E0F7FA]" />
        
        {/* Clouds */}
        <motion.div 
          animate={{ x: [0, 50, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-[10%] w-32 h-12 bg-white rounded-full opacity-60 blur-md" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-24 right-[15%] w-40 h-16 bg-white rounded-full opacity-50 blur-lg" 
        />

        {/* Trees / Greenery */}
        <div className="absolute bottom-0 w-full h-[60%] flex items-end justify-around">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="relative w-48 h-full flex flex-col items-center">
                <div className="absolute bottom-0 w-32 h-full bg-[#4CAF50] rounded-t-full opacity-80 blur-xl" style={{ height: `${60 + i * 5}%` }} />
                <div className="absolute bottom-0 w-24 h-[90%] bg-[#2E7D32] rounded-t-full opacity-60 blur-lg" />
            </div>
          ))}
        </div>

        {/* Flowers and Grass */}
        <div className="absolute bottom-0 w-full h-32 bg-[#43A047] rounded-t-[100%]" />
        
        <motion.div 
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-20px] left-[10%] w-32 h-32 text-8xl pointer-events-auto cursor-pointer"
          whileHover={{ scale: 1.2, y: -10 }}
        >
          🌺
        </motion.div>
        
        <motion.div 
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10px] right-[10%] w-32 h-32 text-8xl pointer-events-auto cursor-pointer"
          whileHover={{ scale: 1.2, y: -10 }}
        >
          🌸
        </motion.div>

        <motion.div 
          animate={{ 
            x: [0, 100, 200, 100, 0],
            y: [0, -50, 0, 50, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[40%] left-[40%] w-32 h-32 text-8xl transform scale-x-[-1] pointer-events-auto cursor-pointer z-20"
          whileHover={{ scale: 1.5, rotate: 360, transition: { duration: 0.5 } }}
        >
          🦋
        </motion.div>

        <motion.div 
          animate={{ 
            x: [0, -150, -300, -150, 0],
            y: [0, 80, 0, -80, 0],
            rotate: [0, -15, 15, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] right-[20%] w-32 h-32 text-7xl pointer-events-auto cursor-pointer z-20"
          whileHover={{ scale: 1.5, rotate: -360, transition: { duration: 0.5 } }}
        >
          🦋
        </motion.div>
      </div>

      {/* Foreground UI */}
      <main className="relative z-10 w-full h-screen flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {gameState === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center text-center gap-12"
            >
              <div className="relative">
                <motion.h1 
                  className="text-7xl md:text-9xl font-black text-white drop-shadow-[0_8px_0_rgba(0,0,0,0.2)] mb-2"
                  style={{ WebkitTextStroke: '4px #333', textShadow: '8px 8px 0 #333' }}
                >
                  मराठी
                  <br />
                  मुळाक्षरे
                </motion.h1>
                <p className="text-white text-3xl font-bold drop-shadow-md">Marathi Alphabets</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8">
                <button 
                  onClick={handlePlay}
                  className="group relative px-12 py-6 bg-gradient-to-b from-[#A5D6A7] to-[#4CAF50] rounded-full shadow-[0_10px_0_#2E7D32] hover:translate-y-1 hover:shadow-[0_6px_0_#2E7D32] active:translate-y-2 active:shadow-none transition-all"
                >
                  <span className="text-6xl font-black text-white italic drop-shadow-lg tracking-wider">PLAY</span>
                </button>
              </div>

            </motion.div>
          )}

          {gameState === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="w-full max-w-5xl h-[85vh] bg-[#8B4513] rounded-[3rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-8 border-[#5D2E0A] relative flex flex-col"
            >
              {/* Back Button */}
              <button 
                onClick={goBack}
                className="absolute top-[-20px] left-[-20px] w-16 h-16 bg-[#FBC02D] rounded-full shadow-[0_4px_0_#C49000] flex items-center justify-center text-white hover:scale-110 active:translate-y-1 active:shadow-none transition-all z-20"
              >
                <ArrowLeft size={40} strokeWidth={4} />
              </button>

              <h2 className="text-white text-4xl md:text-6xl font-black text-center mb-8 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">मराठी मुळाक्षरे</h2>

              <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 pb-12">
                  {allLetters.map((item, idx) => (
                      <button
                        key={item.char + idx}
                        onClick={() => handleLetterSelect(idx)}
                        className="aspect-square bg-[#FFF9E6] rounded-2xl shadow-[0_8px_0_#D1C4A3] hover:translate-y-[-4px] hover:shadow-[0_12px_0_#D1C4A3] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center overflow-hidden"
                      >
                        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                           <text
                             x="50"
                             y="55"
                             textAnchor="middle"
                             dominantBaseline="middle"
                             fontSize="60"
                             fontWeight="bold"
                             fill="none"
                             stroke="#5D2E0A"
                             strokeWidth="1"
                             strokeDasharray="0 4"
                             style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                           >
                             {item.char}
                           </text>
                        </svg>
                      </button>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-6 bg-white/20 rounded-full overflow-hidden border-2 border-white/30">
                <div className="h-full bg-white w-1/4 rounded-full" />
              </div>
            </motion.div>
          )}

          {gameState === 'tracing' && (
            <motion.div
              key="tracing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full max-w-5xl h-[90vh] flex flex-col items-center gap-6"
            >
              {/* Header Controls */}
              <div className="w-full flex items-center justify-between px-4">
                <button 
                    onClick={goBack}
                    className="w-16 h-16 bg-[#FBC02D] rounded-full shadow-[0_4px_0_#C49000] flex items-center justify-center text-white hover:scale-110 transition-all"
                >
                    <ArrowLeft size={40} strokeWidth={4} />
                </button>

                <button 
                    className="w-16 h-16 bg-[#448AFF] rounded-full shadow-[0_4px_0_#2962FF] flex items-center justify-center text-white hover:rotate-180 transition-all duration-500"
                    onClick={() => window.location.reload()}
                >
                    <RotateCcw size={40} strokeWidth={4} />
                </button>
              </div>

              {/* Tracing Area */}
              <div className="flex-1 w-full flex items-center justify-center gap-4">
                <button 
                  onClick={() => setCurrentIndex(prev => (prev - 1 + allLetters.length) % allLetters.length)}
                  className="w-20 h-20 bg-[#FB8C00] rounded-full shadow-[0_4px_0_#E65100] flex items-center justify-center text-white hover:scale-110 active:translate-y-1 transition-all shrink-0"
                >
                  <ArrowLeft size={48} strokeWidth={4} />
                </button>

                <div className="flex-1 max-w-2xl aspect-square bg-white rounded-[4rem] p-6 shadow-2xl border-[12px] border-[#FFF9E6] overflow-hidden relative">
                    <TracingBoard 
                        key={currentLetter.char} 
                        letter={currentLetter.char} 
                        phoneme={currentLetter.phoneme}
                        onComplete={() => {}} 
                    />
                </div>

                <button 
                  onClick={() => setCurrentIndex(prev => (prev + 1) % allLetters.length)}
                  className="w-20 h-20 bg-[#FB8C00] rounded-full shadow-[0_4px_0_#E65100] flex items-center justify-center text-white hover:scale-110 active:translate-y-1 transition-all shrink-0"
                >
                  <ArrowRight size={48} strokeWidth={4} />
                </button>
              </div>

              {/* Bottom Decoration */}
              <div className="w-[40%] h-6 bg-white/50 rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700;900&display=swap');
        
        body {
          font-family: 'Noto Sans Devanagari', sans-serif;
          background-color: #87CEEB;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
