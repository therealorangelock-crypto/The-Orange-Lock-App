
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from './translations';

export default function StreakDisplay({ streakCount, showStreak, language = 'en' }) {
  const t = useTranslation(language);
  
  if (!showStreak) return null;

  const getStreakMessage = (count) => {
    if (count === 0) return t.start_journey;
    if (count === 1) return `1 ${t.day_streak}`;
    return `${count} ${t.days_streak}`;
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-4xl"
        >
          🔒
        </motion.div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {getStreakMessage(streakCount)}
          </h2>
          {streakCount > 0 && (
            <p className="text-sm text-gray-600">
              {t.keep_great_work}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
