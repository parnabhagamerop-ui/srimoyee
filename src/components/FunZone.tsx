import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassWater, Trophy, Timer, Play, RotateCcw, Sparkles, Footprints, FlameKindling } from 'lucide-react';

interface FunZoneProps {
  waterIntake: number;
  waterGoal: number;
  onLogWater: (glasses: number) => void;
  sparklePoints: number;
  onAddSparkles: (points: number) => void;
}

export default function FunZone({
  waterIntake,
  waterGoal,
  onLogWater,
  sparklePoints,
  onAddSparkles
}: FunZoneProps) {
  // Game States
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [activeBugIndex, setActiveBugIndex] = useState<number | null>(null);
  const [showGameBonusToast, setShowGameBonusToast] = useState(false);

  // Sparkle floating triggers
  const [floatingWaters, setFloatingWaters] = useState<{ id: number; x: number; y: number }[]>([]);

  // Timer logic for Cramp Buster
  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        
        // Randomly change bug position on grid
        setActiveBugIndex(Math.floor(Math.random() * 9));
      }, 900);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      setActiveBugIndex(null);
      // Award score in sparkle points!
      if (score > 0) {
        onAddSparkles(score);
        setShowGameBonusToast(true);
        setTimeout(() => setShowGameBonusToast(false), 3000);
      }
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  // Start the game
  const startGame = () => {
    setScore(0);
    setTimeLeft(25);
    setIsPlaying(true);
    setActiveBugIndex(Math.floor(Math.random() * 9));
  };

  // Squish a bug
  const handleSquish = (idx: number) => {
    if (!isPlaying || idx !== activeBugIndex) return;
    setScore(prev => prev + 1);
    
    // Instantly move bug to another spot
    let nextIdx = Math.floor(Math.random() * 9);
    while (nextIdx === idx) {
      nextIdx = Math.floor(Math.random() * 9);
    }
    setActiveBugIndex(nextIdx);
  };

  // Add water with splash visual effect
  const handleAddWater = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (waterIntake >= 12) return;
    const nextWater = waterIntake + 1;
    onLogWater(nextWater);
    onAddSparkles(2); // +2 sparkles for drinking water

    // Add floating water icon
    const id = Date.now();
    setFloatingWaters(prev => [...prev, { id, x: e.clientX - 100, y: e.clientY - 120 }]);
    setTimeout(() => {
      setFloatingWaters(prev => prev.filter(w => w.id !== id));
    }, 1000);
  };

  const handleResetWater = () => {
    onLogWater(0);
  };

  // BATHTUB RISING STYLES
  const waterPercentage = Math.min(100, (waterIntake / waterGoal) * 100);

  return (
    <div id="funzone-container" className="flex flex-col gap-6 w-full relative">

      {/* WATER TRACKER SECTION */}
      <div className="bg-white border-bubbly rounded-3xl p-5 bubbly-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-mono font-black px-2.5 py-0.5 bg-sky-100 text-sky-700 rounded-full border-bubbly-sm border-sky-300">
              Splash Hydration
            </span>
            <h3 className="font-mono text-lg font-black text-gray-800 mt-1 flex items-center gap-1.5">
              🐳 Water Bath Challenge
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-sans leading-tight">
              Drink water to fill Lulu's bubble tub! (+2 Sparkles/glass)
            </p>
          </div>

          <div className="text-right">
            <span className="text-sm font-mono font-black text-sky-600 block">
              {waterIntake} / {waterGoal} cups
            </span>
            <span className="text-[10px] font-sans text-gray-400">Target: 8 Cups</span>
          </div>
        </div>

        {/* BATHTUB VISUAL */}
        <div className="w-full h-40 bg-slate-100 border-bubbly rounded-2xl relative overflow-hidden flex items-end">
          {/* Water background level */}
          <motion.div
            animate={{ height: `${20 + waterPercentage * 0.7}%` }}
            transition={{ type: 'spring', stiffness: 60, damping: 10 }}
            className="w-full bg-gradient-to-t from-sky-400 to-sky-300 relative border-t-3 border-sky-500"
          >
            {/* Waves effect inside bathtub */}
            <div className="absolute top-0 inset-x-0 h-2 bg-sky-200/40 animate-pulse"></div>

            {/* Floaties based on water state */}
            {waterIntake >= 3 && (
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute left-10 top-[-25px] text-3xl select-none"
                title="Squeaky Duck"
              >
                🦆
              </motion.div>
            )}

            {waterIntake >= 6 && (
              <motion.div
                animate={{ y: [0, -3, 0], x: [0, 4, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute right-12 top-[-20px] text-2xl select-none"
              >
                ⛵
              </motion.div>
            )}

            {/* Bubble particles */}
            {[...Array(waterIntake)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -100],
                  x: [0, Math.sin(i) * 15],
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1.1, 0.5]
                }}
                transition={{
                  duration: 2.5 + i * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute w-2 h-2 bg-white/60 rounded-full border border-sky-200"
                style={{
                  bottom: '10px',
                  left: `${15 + i * 8}%`
                }}
              />
            ))}
          </motion.div>

          {/* Bathtub outlines inside */}
          <div className="absolute inset-x-4 bottom-2 h-4 bg-white/25 rounded-full pointer-events-none"></div>

          {/* Squeaky clean Lulu head peek in the bathtub */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[20%] text-center pointer-events-none z-10 flex flex-col items-center">
            {waterIntake >= waterGoal ? (
              <>
                <span className="text-4xl animate-bounce">👑</span>
                <span className="text-xs font-mono font-extrabold text-blue-900 bg-white/80 py-0.5 px-2 rounded-full border-bubbly-sm">
                  Super Squeaky Clean!
                </span>
              </>
            ) : (
              <span className="text-3xl animate-pulse">🧼</span>
            )}
          </div>
        </div>

        {/* LOG WATER BUTTONS */}
        <div className="flex gap-2.5 mt-4">
          <motion.button
            onClick={handleAddWater}
            disabled={waterIntake >= 12}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`flex-1 py-3 bg-sky-400 hover:bg-sky-500 text-white font-mono font-black rounded-2xl border-bubbly bubbly-shadow-sm cursor-pointer flex items-center justify-center gap-1.5 ${
              waterIntake >= 12 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <GlassWater size={18} />
            Drink 1 Glass (+2 ✨)
          </motion.button>

          <button
            onClick={handleResetWater}
            className="p-3 border-bubbly-sm rounded-2xl hover:bg-red-50 text-red-500 cursor-pointer bg-white transition-all flex items-center justify-center"
            title="Reset glass counter"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* CRAMP BUSTER MINI GAME SECTION */}
      <div className="bg-white border-bubbly rounded-3xl p-5 bubbly-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-mono font-black px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full border-bubbly-sm border-red-300">
              Distraction Station
            </span>
            <h3 className="font-mono text-lg font-black text-gray-800 mt-1 flex items-center gap-1.5">
              💥 Cramp Squisher Game
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-sans leading-tight">
              Squish grumpy cramp bugs to distract your mind! (+1 ✨ per tap)
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-gray-500 block">Score</span>
            <span className="text-lg font-mono font-black text-red-500 block">
              🎯 {score}
            </span>
          </div>
        </div>

        {/* GAME PLAY AREA */}
        {!isPlaying && timeLeft === 25 ? (
          /* Start Screen */
          <div className="w-full h-56 bg-[#FFF2F4] border-2 border-dashed border-red-300 rounded-2xl flex flex-col justify-center items-center gap-3 p-4 text-center">
            <div className="text-4xl animate-bounce">🐛😡</div>
            <h4 className="font-mono text-sm font-black text-gray-800 leading-tight">
              Uterus is Crampy? Let's smash some virtual PMS Monsters!
            </h4>
            <p className="text-[10px] text-gray-500 leading-snug">
              Cramp bugs will pop up in the grid below. Tap them as fast as you can in 25 seconds!
            </p>
            <motion.button
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 bg-red-400 hover:bg-red-500 text-white font-mono font-black rounded-xl border-bubbly-sm bubbly-shadow-sm flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Play size={14} /> Start Squishing!
            </motion.button>
          </div>
        ) : (
          /* Active Game Area */
          <div className="flex flex-col gap-3">
            {/* Timer and Score bar */}
            <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border-2 border-gray-200 text-xs font-mono font-bold text-gray-700">
              <span className="flex items-center gap-1">
                <Timer size={14} className={timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-500'} />
                Time: {timeLeft}s
              </span>
              <span>Bugs Squished: {score}</span>
            </div>

            {/* 3x3 Grid */}
            <div className="grid grid-cols-3 gap-2.5 bg-gray-100 p-2.5 rounded-2xl border-bubbly-sm">
              {[...Array(9)].map((_, i) => {
                const isBug = i === activeBugIndex;
                return (
                  <div
                    key={i}
                    onClick={() => handleSquish(i)}
                    className={`aspect-square rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${
                      isBug
                        ? 'bg-red-100 border-red-400 active:bg-red-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <AnimatePresence>
                      {isBug && (
                        <motion.div
                          initial={{ scale: 0.3, rotate: -20 }}
                          animate={{ scale: [1.2, 1], rotate: [0, 5, -5, 0] }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="flex flex-col items-center justify-center select-none"
                        >
                          {/* Cute grumpy bug emoji */}
                          <span className="text-3xl filter drop-shadow">👾</span>
                          <span className="text-[7px] font-mono font-black text-red-500 bg-white/90 border border-red-300 px-1 rounded uppercase tracking-tighter mt-0.5 leading-none">
                            TAP ME!
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Cancel/Reset Button */}
            <button
              onClick={() => {
                setIsPlaying(false);
                setActiveBugIndex(null);
                setTimeLeft(25);
                setScore(0);
              }}
              className="text-[10px] font-mono text-gray-400 hover:text-red-400 cursor-pointer text-center mt-1"
            >
              Give up and go home
            </button>
          </div>
        )}
      </div>

      {/* Floating Splashes */}
      <AnimatePresence>
        {floatingWaters.map(w => (
          <motion.div
            key={w.id}
            initial={{ opacity: 1, scale: 1, x: w.x, y: w.y }}
            animate={{ opacity: 0, scale: 2, y: w.y - 100 }}
            exit={{ opacity: 0 }}
            className="absolute text-4xl pointer-events-none z-50 text-sky-400"
          >
            💦
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Game Sparkle Reward Toast */}
      <AnimatePresence>
        {showGameBonusToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-3.5 rounded-full flex items-center gap-2.5 border-bubbly-sm shadow-2xl z-50 text-xs font-sans font-bold"
          >
            <div className="bg-yellow-400 text-gray-900 rounded-full p-1">
              <Sparkles size={14} className="animate-spin" />
            </div>
            <span>Great job! You earned +{score} Sparkles! ✨</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
