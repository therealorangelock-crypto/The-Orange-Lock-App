
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Power, Check } from 'lucide-react';
import { useTranslation } from './translations';

export default function LockOffNotification({ show, duration, onComplete, language = 'en' }) {
  const t = useTranslation(language);

  useEffect(() => {
    if (show) {
      const timeout = setTimeout(() => {
        onComplete?.();
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] max-w-md w-full px-4"
        >
          <div className="bg-gray-900 border-2 border-orange-600 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold">{t.lock_off_activated}</h3>
                <p className="text-gray-300 text-sm">
                  {t.search_blocked_for} {duration} {t.hours}
                </p>
              </div>
              <Power className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
