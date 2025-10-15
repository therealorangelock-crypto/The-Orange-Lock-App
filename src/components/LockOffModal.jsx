
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Power } from 'lucide-react';
import { User } from '@/api/entities';
import { useTranslation } from './translations';

export default function LockOffModal({ show, onClose, onSuccess, language = 'en' }) {
  const [step, setStep] = useState('duration'); // 'duration', 'confirm'
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [isActivating, setIsActivating] = useState(false);
  const t = useTranslation(language);

  const durations = [
    { hours: 2, label: `2 ${t.hours}` },
    { hours: 8, label: `8 ${t.hours}` },
    { hours: 12, label: `12 ${t.hours}` },
    { hours: 24, label: `24 ${t.hours}` },
    { hours: 48, label: `48 ${t.hours}` },
    { hours: 72, label: `72 ${t.hours}` }
  ];

  const handleDurationSelect = (hours) => {
    setSelectedDuration(hours);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (isActivating) return;
    
    setIsActivating(true);
    try {
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + selectedDuration);
      
      await User.updateMyUserData({
        lockOffActive: true,
        lockOffEndTime: endTime.toISOString(),
        lockOffDuration: selectedDuration
      });
      
      onSuccess?.(selectedDuration);
      handleClose();
    } catch (error) {
      console.error('Error activating LOCK-OFF:', error);
    } finally {
      setIsActivating(false);
    }
  };

  const handleClose = () => {
    setStep('duration');
    setSelectedDuration(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-4 max-w-md mx-auto my-auto bg-gray-900 rounded-3xl p-6 z-50 max-h-[90vh] overflow-y-auto border border-gray-700"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {step === 'duration' && (
              <div>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                    <Power className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{t.lock_off}</h2>
                    <p className="text-sm text-gray-400">{t.block_search}</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-6">
                  {t.how_long_block}
                </p>

                {/* Duration Options */}
                <div className="grid grid-cols-2 gap-3">
                  {durations.map((duration) => (
                    <Button
                      key={duration.hours}
                      onClick={() => handleDurationSelect(duration.hours)}
                      className="h-16 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-semibold"
                    >
                      {duration.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {step === 'confirm' && (
              <div>
                {/* Warning Header */}
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-4">
                  {t.are_you_sure}
                </h2>

                <div className="bg-gray-800 rounded-2xl p-4 mb-6 space-y-3">
                  <p className="text-white font-semibold">
                    {t.will_block_access}
                  </p>
                  <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
                    <li>{t.google_search}</li>
                    <li>{t.safari}</li>
                    <li>{t.chrome}</li>
                    <li>{t.other_search}</li>
                  </ul>
                  <p className="text-orange-400 font-semibold text-sm mt-4">
                    {t.duration}: {selectedDuration} {t.hours}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    {t.cannot_undone}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep('duration')}
                    variant="outline"
                    className="flex-1 bg-transparent border-gray-700 text-white hover:bg-gray-800"
                  >
                    {t.go_back}
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={isActivating}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isActivating ? t.activating : t.activate_lock_off}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
