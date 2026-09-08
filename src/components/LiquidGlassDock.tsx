import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenType } from '../types';

interface LiquidGlassDockProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenNotifyModal: () => void;
  onOpenDonate: () => void;
}

export const LiquidGlassDock: React.FC<LiquidGlassDockProps> = ({
  currentScreen,
  onNavigate,
  onOpenNotifyModal,
  onOpenDonate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Monitor scroll for scroll-to-top visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-none select-none">
      {/* Expanded Quick Action Flyout */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 12, scale: 0.94, filter: 'blur(6px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="pointer-events-auto liquid-glass-dock rounded-3xl p-3 shadow-2xl flex flex-col gap-2 min-w-[220px]"
          >
            <div className="px-2 py-1 border-b border-white/60 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E1B4B]">
                Quick Controls
              </span>
              <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
            </div>

            {/* Quick Action: Apply / Alert */}
            <motion.button
              whileHover={{ x: 2, backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsExpanded(false);
                onOpenNotifyModal();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold text-[#1E1B4B] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
              </div>
              <div className="flex flex-col">
                <span>Scholarship Alert</span>
                <span className="text-[10px] text-[#6E6B7E] font-normal">2026/2027 Cycle</span>
              </div>
            </motion.button>

            {/* Quick Action: Support Foundation */}
            <motion.button
              whileHover={{ x: 2, backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsExpanded(false);
                onOpenDonate();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold text-[#1E1B4B] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-[#D97706] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
              </div>
              <div className="flex flex-col">
                <span>Donate to Scholars</span>
                <span className="text-[10px] text-[#6E6B7E] font-normal">100% Direct Impact</span>
              </div>
            </motion.button>

            {/* Quick Action: Verify Credentials */}
            <motion.button
              whileHover={{ x: 2, backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsExpanded(false);
                onNavigate('contact-us');
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold text-[#1E1B4B] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-[#e3dfff] text-[#181445] flex items-center justify-center shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-[16px]">verified</span>
              </div>
              <div className="flex flex-col">
                <span>Verification Desk</span>
                <span className="text-[10px] text-[#6E6B7E] font-normal">Secretariat Registry</span>
              </div>
            </motion.button>

            {/* Quick Action: Leadership & Founders */}
            <motion.button
              whileHover={{ x: 2, backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsExpanded(false);
                onNavigate('about-us');
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold text-[#1E1B4B] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-[#f5f3ef] text-[#4B485A] flex items-center justify-center shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-[16px]">groups</span>
              </div>
              <div className="flex flex-col">
                <span>Founders &amp; Council</span>
                <span className="text-[10px] text-[#6E6B7E] font-normal">Emmanuel Azu &amp; Team</span>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Main Glass Capsule Pill */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="pointer-events-auto flex items-center gap-2"
      >
        {/* Scroll To Top Pill Button (conditionally visible) */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.92 }}
              onClick={scrollToTop}
              title="Return to top"
              className="w-10 h-10 rounded-full liquid-glass-dock flex items-center justify-center text-[#1E1B4B] shadow-lg transition-transform"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Primary Liquid Glass Floating Dock Pill */}
        <div className="liquid-glass-dock rounded-full p-1.5 flex items-center gap-1.5 shadow-xl border border-white/80">
          {/* Quick Apply / Alert Pill */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenNotifyModal}
            className="liquid-glass-amber-btn text-white text-xs font-bold h-9 px-3.5 rounded-full flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">notifications_active</span>
            <span className="hidden sm:inline">Scholarship</span>
            <span>Alert</span>
          </motion.button>

          {/* Quick Toggle / Services Capsule */}
          <motion.button
            whileHover={{ scale: 1.08, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label="Toggle Quick Controls"
            title="Toggle Quick Controls"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isExpanded
                ? 'bg-[#1E1B4B] text-white shadow-xs'
                : 'text-[#1E1B4B] hover:bg-white/70'
            }`}
          >
            <motion.span
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="material-symbols-outlined text-[20px]"
            >
              {isExpanded ? 'close' : 'apps'}
            </motion.span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
