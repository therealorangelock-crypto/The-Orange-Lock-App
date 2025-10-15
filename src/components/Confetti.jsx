
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Confetti({ show, onComplete }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: ['#C2410C', '#EA580C', '#9A3412', '#000000', '#FFFFFF'][Math.floor(Math.random() * 5)]
      }));
      setParticles(newParticles);

      const timeout = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [show, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              y: -10, 
              x: `${particle.x}vw`,
              rotate: 0,
              opacity: 1 
            }}
            animate={{ 
              y: "110vh", 
              rotate: 360,
              opacity: 0 
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 2.5,
              delay: particle.delay,
              ease: "easeOut"
            }}
            className="absolute w-3 h-3 rounded-full"
            style={{ backgroundColor: particle.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
