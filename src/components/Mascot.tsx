import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MASCOT_DIALOGUES, ACCESSORIES, PHASE_INFO } from '../data';
import { AccessoryType } from '../types';

interface MascotProps {
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  currentMoodId: string;
  selectedAccessory: AccessoryType;
  sparklePoints: number;
  onPoke: () => void;
}

export default function Mascot({
  phase,
  currentMoodId,
  selectedAccessory,
  sparklePoints,
  onPoke
}: MascotProps) {
  const [bubbleText, setBubbleText] = useState<string>('');
  const [isJumping, setIsJumping] = useState(false);
  const [expression, setExpression] = useState<'happy' | 'sleepy' | 'grumpy' | 'sparkly' | 'calm'>('calm');

  // Determine expression based on phase and mood
  useEffect(() => {
    if (currentMoodId === 'angry') {
      setExpression('grumpy');
    } else if (currentMoodId === 'sparkly' || phase === 'ovulatory') {
      setExpression('sparkly');
    } else if (currentMoodId === 'cloudy' || phase === 'luteal') {
      setExpression('grumpy');
    } else if (currentMoodId === 'sleepy' || phase === 'menstrual') {
      setExpression('sleepy');
    } else {
      setExpression('happy');
    }
  }, [phase, currentMoodId]);

  // Set initial bubble text
  useEffect(() => {
    const dialogues = MASCOT_DIALOGUES[phase];
    const randomText = dialogues[Math.floor(Math.random() * dialogues.length)];
    setBubbleText(randomText);
  }, [phase]);

  const handleTapMascot = () => {
    setIsJumping(true);
    onPoke(); // Trigger sparkle point bonus in parent
    
    // Pick a random tapped dialogue or phase dialogue
    const isSpecial = Math.random() > 0.4;
    const dialogues = isSpecial ? MASCOT_DIALOGUES.tapped : MASCOT_DIALOGUES[phase];
    const randomText = dialogues[Math.floor(Math.random() * dialogues.length)];
    setBubbleText(randomText);

    setTimeout(() => setIsJumping(false), 600);
  };

  const getMascotColor = () => {
    switch (phase) {
      case 'menstrual':
        return { main: '#FF7597', shadow: '#E05E7E', cheeks: '#FFA3B9' }; // Soft red/pink
      case 'follicular':
        return { main: '#FFB4C2', shadow: '#E29BA9', cheeks: '#FFCCD5' }; // Pastel blossom pink
      case 'ovulatory':
        return { main: '#FFD166', shadow: '#E0B54F', cheeks: '#FFE19E' }; // Bright warm yellow-orange
      case 'luteal':
        return { main: '#BDB2FF', shadow: '#9D91E0', cheeks: '#D8D1FF' }; // Moody lilac blue
      default:
        return { main: '#FFB4C2', shadow: '#E29BA9', cheeks: '#FFCCD5' };
    }
  };

  const colors = getMascotColor();

  return (
    <div id="mascot-container" className="flex flex-col items-center justify-center py-6 px-4 relative w-full select-none">
      
      {/* Dialogue Bubble */}
      <AnimatePresence mode="wait">
        {bubbleText && (
          <motion.div
            key={bubbleText}
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="relative bg-white border-bubbly rounded-3xl p-4 mb-5 max-w-[280px] text-center font-sans font-medium text-gray-800 text-sm bubbly-shadow-sm z-10"
          >
            <p className="leading-relaxed">{bubbleText}</p>
            {/* Speech bubble tail */}
            <div className="absolute bottom-[-11px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-3 border-b-3 border-gray-800 rotate-45 transform"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main mascot body and animation container */}
      <motion.div
        id="lulu-body-wrapper"
        onClick={handleTapMascot}
        animate={
          isJumping
            ? {
                y: [0, -45, 10, -5, 0],
                scaleX: [1, 0.85, 1.1, 0.95, 1],
                scaleY: [1, 1.2, 0.85, 1.05, 1]
              }
            : {
                y: [0, -6, 0],
                scaleX: [1, 1.02, 1],
                scaleY: [1, 0.97, 1]
              }
        }
        transition={
          isJumping
            ? { duration: 0.6, ease: 'easeInOut' }
            : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
        }
        className="cursor-pointer relative w-52 h-52 flex items-center justify-center filter drop-shadow-md"
      >
        {/* Sparkle background for ovulatory phase */}
        {phase === 'ovulatory' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-yellow-400 font-mono text-lg"
                animate={{
                  y: [-10, -50],
                  x: [0, (i - 2) * 20],
                  opacity: [0, 1, 0],
                  scale: [0.6, 1.2, 0.6]
                }}
                transition={{
                  duration: 2 + i * 0.4,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: i * 0.3
                }}
                style={{
                  top: '40%',
                  left: `${20 + i * 15}%`
                }}
              >
                ✨
              </motion.div>
            ))}
          </div>
        )}

        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          id="lulu-svg"
        >
          {/* Main Shadow under body */}
          <ellipse
            cx="100"
            cy="185"
            rx="55"
            ry="10"
            fill="#3D0C11"
            opacity="0.15"
          />

          {/* Squishy Blob Base Body */}
          <path
            d="M 50,130 
               C 35,100 40,60 80,45 
               C 100,38 115,38 135,45 
               C 175,60 180,100 165,130 
               C 155,150 145,175 107,177 
               C 70,175 55,150 50,130 Z"
            fill={colors.main}
            stroke="#3D0C11"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Core Body shadow (inner dark color) */}
          <path
            d="M 140,165 
               C 155,150 165,130 160,105 
               C 150,125 130,145 107,155
               C 80,145 60,125 50,105
               C 45,130 55,150 70,165
               C 85,173 125,173 140,165 Z"
            fill={colors.shadow}
            opacity="0.5"
          />

          {/* Cute Little Stubby Arms */}
          {/* Left Arm */}
          <motion.path
            d="M 45,115 C 25,110 25,125 45,125 Z"
            fill={colors.main}
            stroke="#3D0C11"
            strokeWidth="4"
            animate={isJumping ? { rotate: [0, -30, 10, 0] } : { rotate: [0, -5, 0] }}
            transition={{ duration: 0.6 }}
            style={{ transformOrigin: '45px 120px' }}
          />
          {/* Right Arm */}
          <motion.path
            d="M 165,115 C 185,110 185,125 165,125 Z"
            fill={colors.main}
            stroke="#3D0C11"
            strokeWidth="4"
            animate={isJumping ? { rotate: [0, 30, -10, 0] } : { rotate: [0, 5, 0] }}
            transition={{ duration: 0.6 }}
            style={{ transformOrigin: '165px 120px' }}
          />

          {/* Rosy Cheeks */}
          <circle cx="68" cy="112" r="10" fill={colors.cheeks} />
          <circle cx="142" cy="112" r="10" fill={colors.cheeks} />

          {/* Facial Expressions Group */}
          <g id="lulu-face">
            {expression === 'happy' && (
              <>
                {/* Curved Happy Eyes */}
                <path d="M 62,100 C 66,92 76,92 80,100" fill="none" stroke="#3D0C11" strokeWidth="5" strokeLinecap="round" />
                <path d="M 130,100 C 134,92 144,92 148,100" fill="none" stroke="#3D0C11" strokeWidth="5" strokeLinecap="round" />
                {/* Cute Open Mouth */}
                <path d="M 98,110 C 93,110 93,122 105,122 C 117,122 117,110 112,110 Z" fill="#E05E7E" stroke="#3D0C11" strokeWidth="4" strokeLinejoin="round" />
                {/* Tiny tongue */}
                <path d="M 101,118 C 103,115 107,115 109,118 C 108,122 102,122 101,118 Z" fill="#FFA3B9" />
              </>
            )}

            {expression === 'sparkly' && (
              <>
                {/* Sparkle star eyes */}
                <path d="M 71,85 L 75,93 L 83,93 L 77,98 L 79,106 L 71,100 L 63,106 L 65,98 L 59,93 L 67,93 Z" fill="#FFD166" stroke="#3D0C11" strokeWidth="3.5" strokeLinejoin="round" />
                <path d="M 139,85 L 143,93 L 151,93 L 145,98 L 147,106 L 139,100 L 131,106 L 133,98 L 127,93 L 135,93 Z" fill="#FFD166" stroke="#3D0C11" strokeWidth="3.5" strokeLinejoin="round" />
                {/* Giant smiling mouth */}
                <path d="M 94,111 C 94,128 116,128 116,111 Z" fill="#ff7597" stroke="#3D0C11" strokeWidth="4" />
              </>
            )}

            {expression === 'sleepy' && (
              <>
                {/* Straight closed lines */}
                <line x1="62" y1="98" x2="78" y2="98" stroke="#3D0C11" strokeWidth="5.5" strokeLinecap="round" />
                <line x1="132" y1="98" x2="148" y2="98" stroke="#3D0C11" strokeWidth="5.5" strokeLinecap="round" />
                {/* Tiny little sleepy O mouth */}
                <circle cx="105" cy="115" r="5" fill="#E05E7E" stroke="#3D0C11" strokeWidth="3" />
                {/* Cute sleep bubble */}
                <motion.circle
                  cx="155"
                  cy="75"
                  r="6"
                  fill="#E8F4F8"
                  stroke="#3D0C11"
                  strokeWidth="2"
                  opacity="0.8"
                  animate={{ scale: [1, 1.6, 1], y: [0, -12, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </>
            )}

            {expression === 'grumpy' && (
              <>
                {/* Angry slanted eyebrows/eyes */}
                <path d="M 60,90 L 78,98" stroke="#3D0C11" strokeWidth="5" strokeLinecap="round" />
                <path d="M 150,90 L 132,98" stroke="#3D0C11" strokeWidth="5" strokeLinecap="round" />
                <circle cx="70" cy="104" r="4.5" fill="#3D0C11" />
                <circle cx="140" cy="104" r="4.5" fill="#3D0C11" />
                {/* Squiggly unhappy mouth */}
                <path d="M 95,116 Q 105,108 115,116" fill="none" stroke="#3D0C11" strokeWidth="4" strokeLinecap="round" />
              </>
            )}

            {expression === 'calm' && (
              <>
                {/* Peaceful closed loops */}
                <path d="M 62,96 C 66,104 76,104 80,96" fill="none" stroke="#3D0C11" strokeWidth="5.5" strokeLinecap="round" />
                <path d="M 130,96 C 134,104 144,104 148,96" fill="none" stroke="#3D0C11" strokeWidth="5.5" strokeLinecap="round" />
                {/* Cute smile line */}
                <path d="M 98,114 Q 105,120 112,114" fill="none" stroke="#3D0C11" strokeWidth="4.5" strokeLinecap="round" />
              </>
            )}
          </g>

          {/* DRESS UP ACCESSORIES OVERLAYS */}
          {selectedAccessory === 'ribbon' && (
            <g id="acc-ribbon" transform="translate(42, 38)">
              {/* Left wing of bow */}
              <path d="M 10,10 C 2,2 2,18 10,10 Z" fill="#ff7597" stroke="#3D0C11" strokeWidth="3" />
              {/* Right wing of bow */}
              <path d="M 18,10 C 26,2 26,18 18,10 Z" fill="#ff7597" stroke="#3D0C11" strokeWidth="3" />
              {/* Center knot */}
              <circle cx="14" cy="10" r="4.5" fill="#ffd166" stroke="#3D0C11" strokeWidth="3" />
              {/* Ribbon tails */}
              <path d="M 12,14 L 6,24 M 16,14 L 20,24" stroke="#3D0C11" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          )}

          {selectedAccessory === 'crown' && (
            <g id="acc-crown" transform="translate(73, 14)">
              {/* Cute Princess Crown */}
              <path
                d="M 5,30 L 0,10 L 15,22 L 27,5 L 39,22 L 54,10 L 49,30 Z"
                fill="#ffd166"
                stroke="#3D0C11"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
              <rect x="10" y="27" width="34" height="4" fill="#E9C46A" />
              {/* Little gem circles */}
              <circle cx="0" cy="10" r="3" fill="#ff7597" stroke="#3D0C11" strokeWidth="2" />
              <circle cx="27" cy="5" r="3" fill="#a8dadc" stroke="#3D0C11" strokeWidth="2" />
              <circle cx="54" cy="10" r="3" fill="#ff7597" stroke="#3D0C11" strokeWidth="2" />
            </g>
          )}

          {selectedAccessory === 'sunglasses' && (
            <g id="acc-sunglasses" transform="translate(48, 88)">
              {/* Thug Life/Retro Black Sunglasses */}
              <rect x="0" y="4" width="45" height="18" rx="4" fill="#3D0C11" stroke="#3D0C11" strokeWidth="2.5" />
              <rect x="58" y="4" width="45" height="18" rx="4" fill="#3D0C11" stroke="#3D0C11" strokeWidth="2.5" />
              <line x1="43" y1="10" x2="60" y2="10" stroke="#3D0C11" strokeWidth="5.5" />
              {/* White shine lines */}
              <line x1="6" y1="8" x2="16" y2="8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="64" y1="8" x2="74" y2="8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {selectedAccessory === 'scarf' && (
            <g id="acc-scarf" transform="translate(45, 148)">
              {/* Wrapped Cozy Winter Muffler around neck base */}
              <rect x="0" y="0" width="110" height="16" rx="8" fill="#F4A261" stroke="#3D0C11" strokeWidth="4" />
              {/* Scarf tail */}
              <path d="M 85,12 L 105,38 L 90,40 L 78,12 Z" fill="#E76F51" stroke="#3D0C11" strokeWidth="4" strokeLinejoin="round" />
              {/* Stripes */}
              <line x1="20" y1="0" x2="20" y2="16" stroke="#E76F51" strokeWidth="5" />
              <line x1="45" y1="0" x2="45" y2="16" stroke="#E76F51" strokeWidth="5" />
              <line x1="70" y1="0" x2="70" y2="16" stroke="#E76F51" strokeWidth="5" />
              {/* Fringes at end of tail */}
              <line x1="90" y1="40" x2="90" y2="45" stroke="#3D0C11" strokeWidth="3" />
              <line x1="95" y1="40" x2="95" y2="45" stroke="#3D0C11" strokeWidth="3" />
              <line x1="100" y1="40" x2="100" y2="45" stroke="#3D0C11" strokeWidth="3" />
            </g>
          )}

          {selectedAccessory === 'sleepmask' && (
            <g id="acc-sleepmask" transform="translate(50, 48)">
              {/* Sleep Mask worn slightly tilted upwards on forehead */}
              <g transform="rotate(-6, 50, 10)">
                <rect x="0" y="0" width="100" height="28" rx="14" fill="#a8dadc" stroke="#3D0C11" strokeWidth="4" />
                {/* Cute eyes shut printed on mask */}
                <path d="M 22,14 Q 30,22 38,14" fill="none" stroke="#3D0C11" strokeWidth="3" strokeLinecap="round" />
                <path d="M 62,14 Q 70,22 78,14" fill="none" stroke="#3D0C11" strokeWidth="3" strokeLinecap="round" />
                {/* Cute little strap on side */}
                <path d="M 0,14 C -12,14 -12,18 -2,18" fill="none" stroke="#3D0C11" strokeWidth="3" />
                <path d="M 100,14 C 112,14 112,18 102,18" fill="none" stroke="#3D0C11" strokeWidth="3" />
              </g>
            </g>
          )}
        </svg>

        {/* Dynamic accessory emoji visual on top right/left */}
        <div className="absolute top-1 right-2 pointer-events-none text-2xl filter drop-shadow-sm">
          {ACCESSORIES.find(a => a.id === selectedAccessory)?.emoji}
        </div>
      </motion.div>

      {/* Touch To Poke Helper Prompt */}
      <motion.p
        animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-3 text-xs font-mono text-gray-500 font-medium bg-white/70 py-1 px-3.5 rounded-full border-bubbly-sm border-dashed"
      >
        👈 Tap to poke Lulu & get Sparkles!
      </motion.p>
    </div>
  );
}
