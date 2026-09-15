import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onComplete?: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  durationMs = 2200,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Lock scrolling while splash screen is active
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, durationMs);

    return () => {
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, [durationMs]);

  const handleAnimationComplete = () => {
    if (!isVisible) {
      document.body.style.overflow = '';
      if (onComplete) onComplete();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isVisible && (
        <motion.div
          id="splash-screen-overlay"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.03,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#111111] select-none cursor-pointer"
          onClick={handleSkip}
          title="Click to skip"
        >
          {/* Ambient Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.3, 0.7, 0.5], scale: [0.9, 1.15, 1.05] }}
            transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
            className="absolute w-96 h-96 rounded-full bg-[#FF6B00]/25 blur-3xl pointer-events-none"
          />

          {/* Core Content Container */}
          <div className="relative flex flex-col items-center justify-center z-10 px-4 text-center">
            {/* Animated Logo Hexagon Badge */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotate: -25 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
              className="relative flex items-center justify-center mb-6"
            >
              {/* Outer decorative ring ripple */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: [1, 1.35, 1.2], opacity: [0.8, 0, 0.3] }}
                transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
                className="absolute inset-0 -m-3 rounded-2xl border-2 border-[#FF6B00]/40 pointer-events-none"
              />

              {/* Logo SVG with animated checkmark stroke */}
              <svg
                width="84"
                height="84"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_12px_24px_rgba(255,107,0,0.45)]"
              >
                {/* Hexagon Shield */}
                <motion.path
                  d="M16 2L2 9V23L16 30L30 23V9L16 2Z"
                  fill="#FF6B00"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />

                {/* Drawn Checkmark */}
                <motion.path
                  d="M10 16L14 20L22 12"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: { delay: 0.35, duration: 0.55, ease: 'easeInOut' },
                    opacity: { delay: 0.35, duration: 0.1 },
                  }}
                />
              </svg>
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-1.5"
            >
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5">
                <span>Tech</span>
                <span className="text-[#FF6B00]">Check</span>
              </h1>

              <motion.p
                initial={{ opacity: 0, letterSpacing: '0.05em' }}
                animate={{ opacity: 0.75, letterSpacing: '0.2em' }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-[11px] uppercase font-bold text-neutral-300 font-mono tracking-widest"
              >
                Better Gear • Smarter Spaces
              </motion.p>
            </motion.div>

            {/* Progress loading line */}
            <div className="w-48 sm:w-56 h-1 bg-neutral-800/80 rounded-full mt-8 overflow-hidden relative">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: (durationMs - 400) / 1000, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-[#FF6B00] to-orange-400 rounded-full shadow-[0_0_8px_#FF6B00]"
              />
            </div>

            {/* Skip hint */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1.0, duration: 0.4 }}
              className="text-[11px] text-neutral-500 mt-4 tracking-wider uppercase font-medium"
            >
              Klik untuk melewati
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
