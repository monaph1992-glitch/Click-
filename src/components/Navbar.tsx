import React from 'react';
import { ActiveTab } from '../types';
import { Power, Globe, Zap } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  serviceActive: boolean;
  setServiceActive: React.Dispatch<React.SetStateAction<boolean>>;
  lang: 'hi' | 'en';
  setLang: (lang: 'hi' | 'en') => void;
  matchCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  serviceActive,
  setServiceActive,
  lang,
  setLang,
  matchCount,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Zone */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('scanner')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition-colors">
              <Zap className="w-4 h-4 fill-emerald-400" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-none">
                MatchSniper<span className="text-emerald-400">.1ms</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {lang === 'hi' ? 'एक्सेसिबिलिटी ऑटो-क्लिक' : 'Accessibility Auto-Clicker'}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-Line, 4-5 items) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`whitespace-nowrap pb-1 transition-colors relative ${
              activeTab === 'scanner'
                ? 'text-emerald-400 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'hi' ? 'लाइव स्क्रीन टेस्ट' : 'Live Screen Test'}
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`whitespace-nowrap pb-1 transition-colors relative ${
              activeTab === 'rules'
                ? 'text-emerald-400 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'hi' ? 'दूरी नियम (<1.8 / >8.1 km)' : 'Distance Rules (<1.8 / >8.1 km)'}
          </button>

          <button
            onClick={() => setActiveTab('hud')}
            className={`whitespace-nowrap pb-1 transition-colors relative ${
              activeTab === 'hud'
                ? 'text-emerald-400 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'hi' ? 'फ्लोटिंग HUD ओवरले' : 'Floating HUD Overlay'}
          </button>

          <button
            onClick={() => setActiveTab('android-apk')}
            className={`whitespace-nowrap pb-1 transition-colors relative ${
              activeTab === 'android-apk'
                ? 'text-emerald-400 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'hi' ? 'एंड्रॉयड कोड व सेटअप' : 'Android Kotlin & Setup'}
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`whitespace-nowrap pb-1 transition-colors relative ${
              activeTab === 'logs'
                ? 'text-emerald-400 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'hi' ? 'ट्रिगर लॉग्स' : 'Trigger Logs'}
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Service Switch & Language) */}
        <div className="flex items-center gap-2.5">
          {/* Language Switch */}
          <button
            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
            title="Switch Language (भाषा बदलें)"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'hi' ? 'EN' : 'हिंदी'}</span>
          </button>

          {/* Master Service Power Toggle */}
          <button
            onClick={() => setServiceActive((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all whitespace-nowrap border ${
              serviceActive
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {serviceActive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  serviceActive ? 'bg-emerald-400' : 'bg-slate-600'
                }`}
              ></span>
            </span>
            <Power className="w-3.5 h-3.5" />
            <span>
              {serviceActive
                ? lang === 'hi'
                  ? 'सर्विस एक्टिव (ON)'
                  : 'Active (ON)'
                : lang === 'hi'
                ? 'सर्विस रुकी (OFF)'
                : 'Paused (OFF)'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto px-3 py-2 border-t border-slate-900 bg-slate-950/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('scanner')}
          className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'scanner' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400'
          }`}
        >
          {lang === 'hi' ? 'स्क्रीन टेस्ट' : 'Screen Test'}
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'rules' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400'
          }`}
        >
          {lang === 'hi' ? 'दूरी नियम' : 'Rules (<1.8 / >8.1)'}
        </button>
        <button
          onClick={() => setActiveTab('hud')}
          className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'hud' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400'
          }`}
        >
          {lang === 'hi' ? 'HUD ओवरले' : 'Overlay HUD'}
        </button>
        <button
          onClick={() => setActiveTab('android-apk')}
          className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'android-apk' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400'
          }`}
        >
          {lang === 'hi' ? 'एंड्रॉयड कोड' : 'Android Code'}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'logs' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400'
          }`}
        >
          {lang === 'hi' ? `लॉग्स (${matchCount})` : `Logs (${matchCount})`}
        </button>
      </div>
    </header>
  );
};
