
import React, { useEffect, useState, useCallback } from 'react';
import { User } from '@/api/entities';
import StreakDisplay from '../components/StreakDisplay';
import Confetti from '../components/Confetti';
import CommitmentList from '../components/CommitmentList';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Sparkles, Shield } from 'lucide-react';
import QuoteDisplay from '../components/QuoteDisplay';
import { useTranslation } from '../components/translations'; // Assuming this file exists and provides the hook

// Define translated motivational activities
const MOTIVATIONAL_ACTIVITIES = {
  en: [
    "Listen to calming music.",
    "Write a short description of how you feel right now and then read it out loud.",
    "Write in your Orange Lock journal how you feel.",
    "Draw or sketch something.",
    "Try Sudoku.",
    "Write a letter to your future self.",
    "Take a selfie.",
    "Watch a documentary about penguins.",
    "Call a friend.",
    "Write a romantic poem.",
    "Go for a 5min walk or run.",
    "Clean your room or home.",
    "Organize your closet or desk.",
    "Take a cold shower or splash water on your face.",
    "Research something you're curious about.",
    "Stretch for 10 min.",
    "Meditate (guided or silent) for 10 min.",
    "Practice deep breathing for 5 minutes.",
    "Write a letter to your past self.",
    "Watch a comedy show.",
    "Listen to 'Mother I Sober' by Kendrick Lamar.",
    "Remind yourself: This feeling will pass.",
    "Go to the gym or fitness class. If not possible exercise at home.",
    "Play your favorite childhood songs.",
    "Do 5 push-ups and 10 jumping jacks outside of your room.",
    "Play a strategy game or chess.",
    "Text someone you trust.",
    "List things you're grateful for on a piece of paper.",
    "Solve a hard brain teaser or riddle.",
    "Make a to-do list for the next day.",
    "Read a book or article.",
    "Listen to an educational podcast.",
    "Ride a bike if you can, if not possible take a walk.",
    "Learn a few words in a new language.",
    "Write a song or lyrics."
  ],
  es: [
    "Escucha música relajante.",
    "Escribe una breve descripción de cómo te sientes ahora y luego léela en voz alta.",
    "Escribe en tu diario Orange Lock cómo te sientes.",
    "Dibuja o haz un boceto de algo.",
    "Prueba Sudoku.",
    "Escribe una carta a tu yo futuro.",
    "Tómate una selfie.",
    "Mira un documental sobre pingüinos.",
    "Llama a un amigo.",
    "Escribe un poema romántico.",
    "Sal a caminar o correr por 5 minutos.",
    "Limpia tu habitación o casa.",
    "Organiza tu armario o escritorio.",
    "Toma una ducha fría o salpica agua en tu cara.",
    "Investiga algo que te dé curiosidad.",
    "Estírate durante 10 minutos.",
    "Medita (guiado o en silencio) durante 10 minutos.",
    "Practica respiración profunda durante 5 minutos.",
    "Escribe una carta a tu yo del pasado.",
    "Mira un programa de comedia.",
    "Listen to 'Mother I Sober' by Kendrick Lamar.",
    "Recuérdate a ti mismo: Este sentimiento pasará.",
    "Ve al gimnasio o a una clase de fitness. Si no es posible, ejercítate en casa.",
    "Reproduce tus canciones favoritas de la infancia.",
    "Haz 5 flexiones y 10 saltos fuera de tu habitación.",
    "Juega un juego de estrategia o ajedrez.",
    "Envía un mensaje a alguien en quien confíes.",
    "Haz una lista de cosas por las que estás agradecido en un papel.",
    "Resuelve un acertijo o rompecabezas difícil.",
    "Haz una lista de tareas para el día siguiente.",
    "Lee un libro o artículo.",
    "Escucha un podcast educativo.",
    "Anda en bicicleta si puedes, si no es posible sal a caminar.",
    "Aprende algunas palabras en un nuevo idioma.",
    "Escribe una canción o letra."
  ],
  de: [
    "Höre beruhigende Musik.",
    "Schreibe eine kurze Beschreibung, wie du dich jetzt fühlst, und lies sie laut vor.",
    "Schreibe in dein Orange Lock Tagebuch, wie du dich fühlst.",
    "Zeichne oder skizziere etwas.",
    "Versuche Sudoku.",
    "Schreibe einen Brief an dein zukünftiges Ich.",
    "Mache ein Selfie.",
    "Schaue eine Dokumentation über Pinguine.",
    "Rufe einen Freund an.",
    "Schreibe ein romantisches Gedicht.",
    "Gehe 5 Minuten spazieren oder joggen.",
    "Räume dein Zimmer oder dein Zuhause auf.",
    "Organisiere deinen Schrank oder Schreibtisch.",
    "Nimm eine kalte Dusche oder spritze Wasser ins Gesicht.",
    "Recherchiere etwas, das dich interessiert.",
    "Dehne dich 10 Minuten lang.",
    "Meditiere (geführt oder still) für 10 Minuten.",
    "Übe 5 Minuten lang tiefes Atmen.",
    "Schreibe einen Brief an dein vergangenes Ich.",
    "Schaue eine Comedy-Show.",
    "Listen to 'Mother I Sober' by Kendrick Lamar.",
    "Erinnere dich: Dieses Gefühl wird vergehen.",
    "Gehe ins Fitnessstudio oder zu einem Fitnesskurs. Falls nicht möglich, trainiere zu Hause.",
    "Spiele deine Lieblingssongs aus der Kindheit.",
    "Mache 5 Liegestütze und 10 Hampelmänner außerhalb deines Zimmers.",
    "Spiele ein Strategiespiel oder Schach.",
    "Schreibe jemandem, dem du vertraust.",
    "Liste Dinge auf, für die du dankbar bist, auf ein Stück Papier.",
    "Löse ein schwieriges Rätsel oder Knobelspiel.",
    "Erstelle eine To-Do-Liste für den nächsten Tag.",
    "Lies ein Buch oder einen Artikel.",
    "Höre einen Bildungspodcast.",
    "Fahre Fahrrad, wenn du kannst, falls nicht möglich, gehe spazieren.",
    "Lerne ein paar Wörter in einer neuen Sprache.",
    "Schreibe ein Lied oder Texte."
  ]
};

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [milestoneReached, setMilestoneReached] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showCommitmentList, setShowCommitmentList] = useState(false);
  
  // Motivation state
  const [currentQuote, setCurrentQuote] = useState('');
  const [showQuote, setShowQuote] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize translation hook
  const t = useTranslation(user?.language || 'en');

  // Define all milestones
  const getMilestones = useCallback(() => {
    const milestones = [7]; // First week
    
    // Every month for the first year (30, 60, 90, ... 330)
    for (let i = 1; i <= 11; i++) {
      milestones.push(i * 30);
    }
    
    // Every year (365, 730, 1095, ... 3650)
    for (let i = 1; i <= 10; i++) {
      milestones.push(i * 365);
    }
    
    return milestones;
  }, []); // getMilestones itself doesn't depend on external state/props, so an empty dependency array is fine.

  const getMilestoneMessage = (days) => {
    if (days === 7) return t.week_clean;
    if (days === 30) return t.month_clean;
    if (days === 60) return `2 ${t.months_clean}`;
    if (days === 90) return `3 ${t.months_clean}`;
    if (days === 120) return `4 ${t.months_clean}`;
    if (days === 150) return `5 ${t.months_clean}`;
    if (days === 180) return `6 ${t.months_clean}`;
    if (days === 210) return `7 ${t.months_clean}`;
    if (days === 240) return `8 ${t.months_clean}`;
    if (days === 270) return `9 ${t.months_clean}`;
    if (days === 300) return `10 ${t.months_clean}`;
    if (days === 330) return `11 ${t.months_clean}`;
    if (days === 365) return t.year_clean;
    if (days === 730) return `2 ${t.years_clean}`;
    if (days === 1095) return `3 ${t.years_clean}`;
    if (days === 1460) return `4 ${t.years_clean}`;
    if (days === 1825) return `5 ${t.years_clean}`;
    if (days === 2190) return `6 ${t.years_clean}`;
    if (days === 2555) return `7 ${t.years_clean}`;
    if (days === 2920) return `8 ${t.years_clean}`;
    if (days === 3285) return `9 ${t.years_clean}`;
    if (days === 3650) return `10 ${t.years_clean}`;
    return `${days} ${t.days_streak}`;
  };

  const loadUserAndUpdateStreak = useCallback(async () => {
    try {
      const currentUser = await User.me();
      const today = format(new Date(), 'yyyy-MM-dd');
      
      let updatedStreak = currentUser.streakCount || 0;
      let shouldShowConfetti = false;
      let milestone = null;

      if (!currentUser.lastLogin) {
        updatedStreak = 1;
      } else {
        const lastLogin = parseISO(currentUser.lastLogin);
        if (isToday(lastLogin)) {
          // No change
        } else if (isYesterday(lastLogin)) {
          updatedStreak = (currentUser.streakCount || 0) + 1;
          // Check if this new streak is a milestone
          const milestones = getMilestones();
          if (milestones.includes(updatedStreak)) {
            shouldShowConfetti = true;
            milestone = updatedStreak;
          }
        } else {
          updatedStreak = 1;
        }
      }

      if (updatedStreak !== currentUser.streakCount || currentUser.lastLogin !== today) {
        await User.updateMyUserData({
          streakCount: updatedStreak,
          lastLogin: today
        });
      }

      const refreshedUser = await User.me();
      setUser(refreshedUser);
      setIsLocked(refreshedUser.isLockedIn || false);
      
      if (shouldShowConfetti) {
        setShowConfetti(true);
        setMilestoneReached(milestone);
      }

    } catch (error) {
      // Check for rate limiting error (status 429)
      if (error.message?.includes('429')) {
        console.log('Rate limit reached, waiting before retry...');
        // Wait for 3 seconds before retrying the user load
        setTimeout(() => {
          loadUserAndUpdateStreak(); // Recursively call to retry
        }, 3000);
        return; // Exit the function early to prevent setLoading(false)
      } else if (error.message?.includes('403')) { // New authentication error handling
        console.log('Authentication required, redirecting to login...');
        await User.login(); // Assuming User.login() handles the redirection or session renewal
        return; // Exit the function early
      } else {
        // Handle other errors
        console.error('Error loading user:', error);
      }
      setLoading(false); // Set loading to false for non-rate-limit and non-auth errors
      return; // Exit the function after handling error
    }
    // If try block succeeds, set loading to false
    setLoading(false);
  }, [getMilestones]); // Added getMilestones to dependency array

  useEffect(() => {
    loadUserAndUpdateStreak();
  }, [loadUserAndUpdateStreak]);

  const handleLockClick = async () => {
    if (isLocked) return;
    
    try {
      await User.updateMyUserData({ isLockedIn: true });
      setIsLocked(true);
    } catch (error) {
      console.error('Error updating lock state:', error);
    }
  };

  const generateQuote = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setShowQuote(false);
    
    setTimeout(() => {
      let activitiesToUse = [];

      // Check if the user has custom motivational quotes
      if (user?.customMotivationalQuotes && user.customMotivationalQuotes.length > 0) {
        activitiesToUse = user.customMotivationalQuotes;
      } else {
        // Fallback to default translated motivational activities
        activitiesToUse = MOTIVATIONAL_ACTIVITIES[user?.language || 'en'] || MOTIVATIONAL_ACTIVITIES.en;
      }

      const randomActivity = activitiesToUse[Math.floor(Math.random() * activitiesToUse.length)];
      setCurrentQuote(randomActivity);
      setShowQuote(true);
      setIsGenerating(false);
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-8 overflow-x-hidden hide-scrollbar" style={{ minHeight: 'calc(100vh - 80px)'}}>
      <style>{`
        /* Hide scrollbar for this component */
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
      
      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
      <CommitmentList show={showCommitmentList} onClose={() => setShowCommitmentList(false)} language={user?.language || 'en'} />
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t.welcome_back}
        </h1>
        <p className="text-gray-700">
          {user?.full_name ? `${t.hi_user} ${user.full_name.split(' ')[0]}` : t.ready_continue}
        </p>
      </motion.div>

      <StreakDisplay 
        streakCount={user?.streakCount || 0}
        showStreak={user?.showStreak !== false}
        language={user?.language || 'en'}
      />

      {milestoneReached && showConfetti && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-6"
          onClick={() => setShowConfetti(false)}
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="bg-white rounded-3xl p-8 text-center max-w-sm"
          >
            <div className="text-6xl mb-4">🎉🔥</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {getMilestoneMessage(milestoneReached)}
            </h2>
            <p className="text-gray-600 mb-4">
              {t.congratulations}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowConfetti(false)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full font-semibold"
            >
              {t.continue_journey}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
      
      {/* Lock Button Section - Central Feature */}
      <div className="flex flex-col items-center justify-center my-12">
        <motion.button
            onClick={handleLockClick}
            className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform focus:outline-none ${
                isLocked 
                ? 'bg-gradient-to-br from-orange-600 to-orange-800 shadow-2xl shadow-orange-800/40 cursor-default' 
                : 'bg-white border-4 border-orange-600 cursor-pointer hover:shadow-lg'
            }`}
            whileHover={!isLocked ? { scale: 1.05 } : {}}
            whileTap={!isLocked ? { scale: 0.95 } : {}}
            aria-label={isLocked ? t.aria_locked : t.aria_unlocked}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={isLocked ? 'locked' : 'unlocked'}
                    initial={{ opacity: 0, rotate: -30, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 30, scale: 0.5 }}
                    transition={{ duration: 0.25, ease: "circOut" }}
                >
                    <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b5942cb5fecbf0616207c1/46b0e5001_logo.png"
                        alt={isLocked ? "Locked" : "Unlocked"}
                        className={`w-20 h-20 transition-all duration-300 ${
                            isLocked 
                                ? 'brightness-0 invert'
                                : 'opacity-60 grayscale'
                        }`}
                        style={{
                            filter: isLocked 
                                ? 'brightness(0) invert(1)' 
                                : 'opacity(0.6) grayscale(100%) brightness(1.2)'
                        }}
                    />
                </motion.div>
            </AnimatePresence>
        </motion.button>
        <motion.p 
            key={isLocked ? 'locked_text' : 'unlocked_text'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mt-6 text-lg font-medium text-gray-800 text-center max-w-xs"
        >
            {isLocked ? t.commitment_locked : t.tap_lock_commitment}
        </motion.p>
        
        {/* Commitment List Button - Only shown when locked */}
        {isLocked && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onClick={() => setShowCommitmentList(true)}
            className="mt-4 bg-white border-2 border-orange-600 text-orange-600 px-4 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-orange-50 transition-colors"
          >
            <Shield className="w-4 h-4" />
            {t.my_commitment_list}
          </motion.button>
        )}
      </div>
      
      {/* Motivation Section */}
      <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full bg-white rounded-3xl p-6 shadow-xl border border-gray-200 text-center"
      >
          <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateQuote}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
              {isGenerating ? (
                  <>
                      <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      {t.finding_activity}
                  </>
              ) : (
                  <>
                      <Sparkles className="w-5 h-5" />
                      {t.i_need_motivation}
                  </>
              )}
          </motion.button>

          <QuoteDisplay quote={currentQuote} show={showQuote} />
      </motion.div>
    </div>
  );
}
