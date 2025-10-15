
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Eye, EyeOff, LogOut, User as UserIcon, Mail, Globe, Heart, Info, Lock, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import LockOffModal from '../components/LockOffModal';
import LockOffNotification from '../components/LockOffNotification';
import { useTranslation } from '../components/translations';

export default function Settings({ user: initialUser, onUserUpdate }) {
  const [user, setUser] = useState(initialUser);
  const [showStreak, setShowStreak] = useState(initialUser?.showStreak !== false);
  const [language, setLanguage] = useState(initialUser?.language || 'en');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showLockOffModal, setShowLockOffModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationDuration, setNotificationDuration] = useState(0);

  const t = useTranslation(user?.language || 'en');

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setShowStreak(currentUser.showStreak !== false);
      setLanguage(currentUser.language || 'en');
    } catch (error) {
      if (error.message?.includes('429')) {
        console.log('Rate limit reached, retrying...');
        setTimeout(() => {
          loadUser();
        }, 2000);
      } else if (error.message?.includes('403')) {
        console.log('Authentication required, redirecting to login...');
        await User.login(); // This likely redirects the user or opens a login modal
      } else {
        console.error('Error loading user:', error);
      }
    }
  };

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setShowStreak(initialUser.showStreak !== false);
      setLanguage(initialUser.language || 'en');
    } else {
      // If no user provided, try to load it
      loadUser();
    }
  }, [initialUser]);

  const handleSettingUpdate = async (setting) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await User.updateMyUserData(setting);
      const updatedUser = { ...user, ...setting };
      setUser(updatedUser);
      onUserUpdate?.(updatedUser);
      
      if (setting.showStreak !== undefined) setShowStreak(setting.showStreak);
      if (setting.language !== undefined) setLanguage(setting.language);
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLockOffSuccess = (duration) => {
    setNotificationDuration(duration);
    setShowNotification(true);
  };

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isPremium = user?.subscriptionStatus === 'premium';

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-8 min-h-screen bg-black">
      <LockOffModal 
        show={showLockOffModal} 
        onClose={() => setShowLockOffModal(false)}
        onSuccess={handleLockOffSuccess}
        language={user?.language || 'en'}
      />
      <LockOffNotification 
        show={showNotification} 
        duration={notificationDuration}
        onComplete={() => setShowNotification(false)}
        language={user?.language || 'en'}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-orange-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <SettingsIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {t.settings}
        </h1>
        <p className="text-gray-300">
          {t.customize_journey}
        </p>
      </motion.div>

      {/* Premium Button - Show LOCK-OFF if premium, Get LOCK+ if free */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05, duration: 0.5 }}
        className="mb-6"
      >
        {isPremium ? (
          <Button 
            onClick={() => setShowLockOffModal(true)}
            className="w-full py-6 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
          >
            <Power className="w-5 h-5" />
            {t.lock_off}
          </Button>
        ) : (
          <Button 
            className="w-full py-6 bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 text-white rounded-2xl font-bold text-lg shadow-lg"
          >
            <span className="flex items-center gap-0.5">
              {user?.language === 'es' ? 'Obtener L' : user?.language === 'de' ? 'L' : 'Get L'}<Lock className="w-5 h-5 mx-0.5" style={{ marginTop: '-2px' }} />{user?.language === 'es' ? 'CK+' : user?.language === 'de' ? 'CK+ Holen' : 'CK+'}
            </span>
          </Button>
        )}
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700 mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-800 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {user?.full_name || 'User'}
            </h3>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Preferences Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700 mb-6 space-y-6"
      >
        {/* Streak Visibility */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showStreak ? <Eye className="w-5 h-5 text-orange-500" /> : <EyeOff className="w-5 h-5 text-gray-400" />}
            <div>
              <h3 className="font-semibold text-white">{t.show_streak_counter}</h3>
              <p className="text-sm text-gray-400">{t.display_streak}</p>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleSettingUpdate({ showStreak: !showStreak })} className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${showStreak ? 'bg-orange-600' : 'bg-gray-600'}`}>
            <motion.div initial={false} animate={{ x: showStreak ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="w-6 h-6 bg-white rounded-full shadow-md absolute top-1" />
          </motion.button>
        </div>

        {/* Language Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="font-semibold text-white">{t.language}</h3>
              <p className="text-sm text-gray-400">{t.set_language}</p>
            </div>
          </div>
          <Select value={language} onValueChange={(value) => handleSettingUpdate({ language: value })}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Support & Info Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-gray-900 rounded-2xl p-6 border border-gray-700 mb-6 space-y-4"
      >
        {/* Send Feedback */}
        <a href="mailto:feedback@serenitysteps.app?subject=App Feedback" className="flex items-center justify-between p-3 -m-3 rounded-lg hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-white">{t.send_feedback}</h3>
            </div>
        </a>
        {/* About */}
        <div>
          <h3 className="font-semibold text-white mb-3 text-lg">{t.about_serenity}</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>• {t.track_progress}</p>
            <p>• {t.get_motivation}</p>
            <p>• {t.celebrate_milestones}</p>
            <p>• {t.private_secure}</p>
          </div>
        </div>
        {/* Donation */}
        <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white">{t.support_cause}</h3>
                    <Popover>
                        <PopoverTrigger asChild>
                            <button><Info className="w-4 h-4 text-gray-400 hover:text-white" /></button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 bg-gray-800 border-gray-700 text-white text-sm p-3">
                            {t.all_donations}
                        </PopoverContent>
                    </Popover>
                </div>
                <Button variant="outline" className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 border-orange-800 bg-transparent rounded-lg font-semibold">
                    <Heart className="w-4 h-4 mr-2" /> {t.donate}
                </Button>
            </div>
        </div>
      </motion.div>

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Button onClick={handleLogout} variant="outline" className="w-full py-4 text-red-400 hover:text-red-300 hover:bg-red-900/20 border-red-800 bg-transparent rounded-2xl font-semibold">
          <LogOut className="w-5 h-5 mr-2" />
          {t.sign_out}
        </Button>
      </motion.div>
    </div>
  );
}
