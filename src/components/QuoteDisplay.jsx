import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuoteDisplay({ quote, show }) {
  return (
    <AnimatePresence>
      {show && quote && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border border-orange-200"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-center text-gray-800 font-medium leading-relaxed"
          >
            {quote}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}