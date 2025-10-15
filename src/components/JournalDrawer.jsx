
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { X, Send, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { useTranslation } from './translations'; // Corrected path

export default function JournalDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [userLanguage, setUserLanguage] = useState('en');
  const t = useTranslation(userLanguage);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const user = await User.me();
          setMessages(user.journalEntries || []);
          setUserLanguage(user.language || 'en'); // Load user's preferred language
        } catch (error) {
          if (error.message?.includes('429')) {
            console.log('Rate limit reached, please wait...');
            setTimeout(() => {
              fetchData();
            }, 2000);
          } else if (error.message?.includes('403')) {
            console.log('Authentication required');
            await User.login();
          } else {
            console.error('Error loading journal entries or user language:', error);
          }
        }
      };
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    const newUserMessage = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      userMessage: userMsg,
      aiResponse: null
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Ensure messages used for context are up-to-date, including the new user message
      const currentMessagesForContext = [...messages, newUserMessage];

      const context = currentMessagesForContext.length > 0 
        ? `Previous conversation context: ${currentMessagesForContext.slice(-3).map(m => `User: ${m.userMessage}\nAI: ${m.aiResponse}`).filter(Boolean).join('\n\n')}\n\n`
        : '';

      const languageInstruction = userLanguage === 'es' ? 'Respond in Spanish.' : userLanguage === 'de' ? 'Respond in German.' : 'Respond in English.';

      const prompt = `${context}You are a compassionate AI therapist helping someone in their recovery journey from pornography addiction. They are using an app called "Serenity Steps" to track their progress. Be empathetic, supportive, and provide practical advice. Keep responses concise (2-3 paragraphs max) and encouraging. ${languageInstruction}

User's message: ${userMsg}

Provide a helpful, supportive response:`;

      const response = await InvokeLLM({ prompt });

      const updatedMessage = {
        ...newUserMessage,
        aiResponse: response
      };

      // Find the index of the message to update (it will be the last one added before AI response)
      setMessages(prev => {
        const tempMessages = [...prev];
        // Replace the last message (which is newUserMessage with aiResponse null) with updatedMessage
        tempMessages[tempMessages.length - 1] = updatedMessage;
        User.updateMyUserData({ journalEntries: tempMessages }); // Persist latest state
        return tempMessages;
      });

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        ...newUserMessage,
        aiResponse: t.connection_error
      };
      // Find the index of the message to update and replace it with the error message
      setMessages(prev => {
        const tempMessages = [...prev];
        tempMessages[tempMessages.length - 1] = errorMessage;
        User.updateMyUserData({ journalEntries: tempMessages }); // Persist latest state including error
        return tempMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Click Handle */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-30 w-6 h-20 bg-orange-600 rounded-r-xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-orange-700 transition-colors"
        whileHover={{ width: 28 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex flex-col gap-1">
          <div className="w-1 h-1 bg-white rounded-full" />
          <div className="w-1 h-1 bg-white rounded-full" />
          <div className="w-1 h-1 bg-white rounded-full" />
        </div>
      </motion.button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-full max-w-md bg-gray-900 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-600 to-orange-800 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{t.ai_journal}</h2>
                    <p className="text-sm text-orange-100">{t.private_therapist}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <Sparkles className="w-16 h-16 text-orange-500 mb-4" />
                    <h3 className="text-white font-semibold text-lg mb-2">
                      {t.welcome_journal}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {t.share_thoughts}
                    </p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div key={msg.id} className="space-y-3">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-orange-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                        <p className="text-sm">{msg.userMessage}</p>
                      </div>
                    </div>

                    {/* AI Response */}
                    {msg.aiResponse && (
                      <div className="flex justify-start">
                        <div className="bg-gray-800 text-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                          <p className="text-sm whitespace-pre-wrap">{msg.aiResponse}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 text-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-gray-800 border-t border-gray-700">
                <div className="flex gap-2">
                  <Textarea
                    placeholder={t.share_mind}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 bg-gray-900 border-gray-700 text-white resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-orange-600 hover:bg-orange-700 h-auto px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
