
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Shield } from 'lucide-react';
import { useTranslation } from './translations';

// This is a placeholder for the translations utility.
// In a real application, you would have a `translations.js` or `translations.ts` file
// in `../utils/` that exports a `useTranslation` hook.
// Example `../utils/translations.js`:
/*
const translations = {
  en: {
    my_commitment_list: "My Commitment List",
    websites_avoid: "Websites you want to avoid",
    enter_website: "Enter website (e.g., example.com)",
    no_sites_added: "No sites added yet.",
    add_websites: "Add websites you want to avoid above.",
    close: "Close",
  },
  es: {
    my_commitment_list: "Mi Lista de Compromisos",
    websites_avoid: "Sitios web que quieres evitar",
    enter_website: "Introducir sitio web (ej., ejemplo.com)",
    no_sites_added: "Aún no se han añadido sitios.",
    add_websites: "Añade sitios web que quieres evitar arriba.",
    close: "Cerrar",
  },
  de: {
    my_commitment_list: "Meine Verpflichtungsliste",
    websites_avoid: "Websites, die Sie meiden möchten",
    enter_website: "Website eingeben (z.B. beispiel.de)",
    no_sites_added: "Noch keine Websites hinzugefügt.",
    add_websites: "Fügen Sie oben Websites hinzu, die Sie meiden möchten.",
    close: "Schließen",
  },
};

export const useTranslation = (language) => {
  return translations[language] || translations.en;
};
*/

export default function CommitmentList({ show, onClose, language = 'en' }) {
  const [commitmentList, setCommitmentList] = useState([]);
  const [newSite, setNewSite] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslation(language);

  useEffect(() => {
    if (show) {
      loadCommitmentList();
    }
  }, [show]);

  const loadCommitmentList = async () => {
    try {
      const user = await User.me();
      setCommitmentList(user.commitmentList || []);
    } catch (error) {
      console.error('Error loading commitment list:', error);
    }
  };

  const addSite = async () => {
    if (!newSite.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      const updatedList = [...commitmentList, newSite.trim()];
      await User.updateMyUserData({ commitmentList: updatedList });
      setCommitmentList(updatedList);
      setNewSite('');
    } catch (error) {
      console.error('Error adding site:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeSite = async (index) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const updatedList = commitmentList.filter((_, i) => i !== index);
      await User.updateMyUserData({ commitmentList: updatedList });
      setCommitmentList(updatedList);
    } catch (error) {
      console.error('Error removing site:', error);
    } finally {
      setIsLoading(false);
    }
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
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-4 max-w-md mx-auto my-auto bg-white rounded-3xl p-6 z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t.my_commitment_list}</h2>
                <p className="text-sm text-gray-600">{t.websites_avoid}</p>
              </div>
            </div>

            {/* Add New Site */}
            <div className="flex gap-2 mb-6">
              <Input
                placeholder={t.enter_website}
                value={newSite}
                onChange={(e) => setNewSite(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSite()}
                className="flex-1"
              />
              <Button 
                onClick={addSite} 
                disabled={!newSite.trim() || isLoading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Sites List */}
            <div className="space-y-3 mb-6">
              {commitmentList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t.no_sites_added}</p>
                  <p className="text-sm">{t.add_websites}</p>
                </div>
              ) : (
                commitmentList.map((site, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-800">{site}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSite(index)}
                      disabled={isLoading}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Close Button */}
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="w-full"
            >
              {t.close}
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
