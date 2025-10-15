

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Settings as SettingsIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from '@/api/entities';
import Settings from "../pages/Settings";
import JournalDrawer from "../components/JournalDrawer";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [user, setUser] = useState(null); // Added state for user data

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser); // Store user data
      setIsPremium(currentUser.subscriptionStatus === 'premium');
    } catch (error) {
      if (error.message?.includes('429')) {
        console.log('Rate limit reached, retrying subscription check...');
        setTimeout(() => {
          checkSubscription();
        }, 2000);
      } else if (error.message?.includes('403')) {
        console.log('Authentication required');
        // User is not authenticated, keep defaults (free tier)
        setIsPremium(false);
      } else {
        console.error('Error checking subscription:', error);
        // Optionally handle the error, e.g., setIsPremium(false) or show an error message
      }
    }
  };

  const backgroundWords = [
    // Coordinated positions with original words
    { text: 'LOVE',    top: '5%',  left: '-15%', delay: '0s' },
    { text: 'FREEDOM', top: '10%', left: '30%',  delay: '1.5s' },
    { text: 'RESPECT', top: '5%',  left: '75%',  delay: '3s' },

    { text: 'RESPECT', top: '25%', left: '-5%',  delay: '0.5s' },
    { text: 'LOVE',    top: '30%', left: '50%',  delay: '2s' },
    { text: 'FREEDOM', top: '25%', left: '90%',  delay: '3.5s' },

    { text: 'FREEDOM', top: '45%', left: '0%',   delay: '1s' },
    { text: 'RESPECT', top: '50%', left: '40%',  delay: '2.5s' },
    { text: 'LOVE',    top: '45%', left: '85%',  delay: '4s' },

    { text: 'LOVE',    top: '65%', left: '15%',  delay: '0.2s' },
    { text: 'FREEDOM', top: '70%', left: '60%',  delay: '1.7s' },
    { text: 'RESPECT', top: '65%', left: '100%', delay: '3.2s' },

    { text: 'RESPECT', top: '85%', left: '-10%', delay: '0.8s' },
    { text: 'LOVE',    top: '90%', left: '45%',  delay: '2.3s' },
    { text: 'FREEDOM', top: '85%', left: '80%',  delay: '3.8s' },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
      <style>{`
        :root {
          --primary-orange: #C2410C;
          --dark-orange: #9A3412;
          --soft-orange: #EA580C;
          --text-gray: #374151;
          --light-gray: #F9FAFB;
        }

        @keyframes wave {
          0%, 100% { transform: translateY(0px) rotate(-45deg); }
          25% { transform: translateY(-8px) rotate(-45deg); }
          50% { transform: translateY(-4px) rotate(-45deg); }
          75% { transform: translateY(-12px) rotate(-45deg); }
        }

        .background-text {
          position: fixed;
          font-family: serif; /* More serious font style */
          font-size: 5rem;
          font-weight: 900;
          color: #EA580C;
          opacity: 0.12;
          pointer-events: none;
          z-index: 0;
          transform: rotate(-45deg);
          animation: wave 8s ease-in-out infinite;
          user-select: none;
          white-space: nowrap;
        }
        
        /* Hide scrollbars */
        .hide-scrollbar {
          -ms-overflow-style: none; /* For Internet Explorer and Edge */
          scrollbar-width: none; /* For Firefox */
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* For Chrome, Safari, and Opera */
        }
        
        /* Media query for mobile devices */
        @media (max-width: 640px) {
          .background-text {
            font-size: 3.5rem; /* Smaller font on phones */
          }
        }
      `}</style>
      
      {/* Background Text */}
      {backgroundWords.map((word, index) => (
        <div
          key={index}
          className="background-text"
          style={{
            top: word.top,
            left: word.left,
            animationDelay: word.delay
          }}
        >
          {word.text}
        </div>
      ))}

      {/* Journal Drawer - Only for Premium Users */}
      {isPremium && <JournalDrawer />}

      {/* Top Settings Icon */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => setShowSettings(true)}
        className="fixed top-6 right-6 z-30 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <SettingsIcon className="w-6 h-6 text-gray-700" />
      </motion.button>
      
      {/* Main Content */}
      <main className="flex-1 relative z-10 hide-scrollbar overflow-y-auto">
        {children}
      </main>

      {/* Settings Slide Overlay */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowSettings(false)}
            />
            
            {/* Settings Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-black z-50 overflow-y-auto hide-scrollbar"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-6 right-6 z-10 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              
              {/* Settings Content - Pass user data */}
              <Settings user={user} onUserUpdate={setUser} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

