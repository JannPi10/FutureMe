'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasShown = sessionStorage.getItem('futureme-splash-shown');
    if (!hasShown) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem('futureme-splash-shown', 'true');
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSkip = () => {
    setShow(false);
    sessionStorage.setItem('futureme-splash-shown', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-tulip-white overflow-hidden"
        >
          {/* Decorative SVG elements */}
          <div className="absolute left-10 md:left-20 top-1/2 -translate-y-1/2 opacity-20">
            <svg width="120" height="200" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 200 C50 150 20 100 20 50 C40 60 70 80 50 200" fill="#E8B7C8"/>
              <circle cx="20" cy="50" r="15" fill="#D98FA8"/>
              <path d="M20 35 C10 20 30 20 20 35" fill="#E8B7C8"/>
            </svg>
          </div>
          
          <div className="absolute right-10 md:right-20 top-1/2 -translate-y-1/2 opacity-20 scale-x-[-1]">
            <svg width="120" height="200" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 200 C50 150 20 100 20 50 C40 60 70 80 50 200" fill="#E8B7C8"/>
              <circle cx="20" cy="50" r="15" fill="#D98FA8"/>
              <path d="M20 35 C10 20 30 20 20 35" fill="#E8B7C8"/>
            </svg>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-center flex flex-col items-center z-10"
          >
            <h1 className="font-serif text-7xl md:text-8xl lg:text-9xl text-carbon mb-2">
              FutureMe
            </h1>
            <h2 className="font-sans text-xl md:text-2xl tracking-[0.3em] text-carbon/70 uppercase">
              by Leidy Sabata
            </h2>
            
            <div className="w-24 h-[1px] bg-rosa-petalo my-8"></div>
            
            <p className="font-serif italic text-xl text-carbon/60">
              Moda que florece
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            onClick={handleSkip}
            className="absolute bottom-16 text-carbon/50 hover:text-carbon text-sm tracking-widest uppercase transition-colors pb-1 border-b border-transparent hover:border-carbon"
          >
            Entrar
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
