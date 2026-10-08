/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { FilterConfig, ActiveTab, ActivityLog } from './types';
import { Navbar } from './components/Navbar';
import { DisplayScannerView } from './components/DisplayScannerView';
import { RulesSettingsView } from './components/RulesSettingsView';
import { AndroidCodeExporter } from './components/AndroidCodeExporter';
import { LogStreamView } from './components/LogStreamView';
import { FloatingHudWidget } from './components/FloatingHudWidget';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('scanner');
  const [lang, setLang] = useState<'hi' | 'en'>('hi');
  const [serviceActive, setServiceActive] = useState<boolean>(true);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [ignoredCount, setIgnoredCount] = useState<number>(0);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Core Configuration (Defaults: < 1.8 km OR > 8.1 km with 1ms reaction delay)
  const [config, setConfig] = useState<FilterConfig>({
    minDistanceKm: 1.8,
    maxDistanceKm: 8.1,
    conditionMode: 'OR',
    responseDelayMs: 1,
    targetKeywords: ['Match', 'Accept', 'Book', 'स्वीकार', 'Order'],
    soundAlert: true,
    vibrationAlert: true,
    amoledMode: true,
    batteryEcoScan: true,
    keepScreenAwake: false,
    autoStopOnScreenOff: true,
    showFloatingHud: true,
    hudPosition: { x: 20, y: 120 },
  });

  const handleLogEvent = (log: ActivityLog) => {
    setLogs((prev) => [log, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div
      className={`min-h-screen text-slate-100 flex flex-col transition-colors ${
        config.amoledMode ? 'bg-black' : 'bg-[#090d16]'
      }`}
    >
      {/* 3-Zone Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serviceActive={serviceActive}
        setServiceActive={setServiceActive}
        lang={lang}
        setLang={setLang}
        matchCount={matchCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {activeTab === 'scanner' && (
          <DisplayScannerView
            config={config}
            serviceActive={serviceActive}
            setServiceActive={setServiceActive}
            lang={lang}
            onLogEvent={handleLogEvent}
            matchCount={matchCount}
            setMatchCount={setMatchCount}
            ignoredCount={ignoredCount}
            setIgnoredCount={setIgnoredCount}
          />
        )}

        {activeTab === 'rules' && (
          <RulesSettingsView config={config} setConfig={setConfig} lang={lang} />
        )}

        {activeTab === 'hud' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h2 className="text-lg font-bold text-white">
                {lang === 'hi' ? 'फ्लोटिंग डिस्प्ले HUD ओवरले' : 'Floating Display Overlay HUD'}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                {lang === 'hi'
                  ? 'यह फ्लोटिंग विजेट मोबाइल स्क्रीन पर किसी भी डिलीवरी ऐप (Uber, Rapido, Ola, Porter) के ऊपर हमेशा तैरता रहता है। आप इसे स्क्रीन पर कहीं भी ड्रैग कर सकते हैं, मिनिमाइज़ कर सकते हैं या तुरंत चालू/बंद कर सकते हैं।'
                  : 'This draggable floating bubble hovers above active gig worker apps, displaying current thresholds and allowing 1-tap emergency toggling.'}
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() =>
                    setConfig((prev) => ({ ...prev, showFloatingHud: !prev.showFloatingHud }))
                  }
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold text-xs transition-colors hover:bg-emerald-500/30"
                >
                  {config.showFloatingHud
                    ? lang === 'hi'
                      ? 'HUD ओवरले छिपाएं'
                      : 'Hide Overlay HUD'
                    : lang === 'hi'
                    ? 'HUD ओवरले दिखाएं'
                    : 'Show Overlay HUD'}
                </button>
              </div>
            </div>

            {/* Quick Demonstration frame */}
            <div className="p-8 rounded-2xl bg-black border border-slate-800 text-center space-y-2">
              <span className="text-xs font-mono text-emerald-400 block">
                {lang === 'hi' ? 'HUD प्रीव्यू एक्टिव है (स्क्रीन पर कहीं भी घुमाएं)' : 'Draggable HUD is active on your screen'}
              </span>
              <p className="text-xs text-slate-500">
                {lang === 'hi'
                  ? 'ऊपर-बाएं कोने में मौजूद छोटे फ्लोटिंग बॉक्स को माउस या टच से ड्रैग करके देखें।'
                  : 'Click and drag the floating overlay badge on the screen to reposition it.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'android-apk' && (
          <AndroidCodeExporter
            lang={lang}
            minDistance={config.minDistanceKm}
            maxDistance={config.maxDistanceKm}
          />
        )}

        {activeTab === 'logs' && (
          <LogStreamView logs={logs} onClearLogs={handleClearLogs} lang={lang} />
        )}
      </main>

      {/* Persistent Floating HUD Widget (Draggable over all tabs) */}
      {config.showFloatingHud && (
        <FloatingHudWidget
          config={config}
          serviceActive={serviceActive}
          setServiceActive={setServiceActive}
          lang={lang}
          matchCount={matchCount}
        />
      )}

      {/* Quiet Footer adhering to anti-slop rules */}
      <footer className="border-t border-slate-900 bg-black/80 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        MatchSniper 1ms · Accessibility Background Distance Filter (&lt;{config.minDistanceKm}km / &gt;{config.maxDistanceKm}km) · AMOLED Display Optimized
      </footer>
    </div>
  );
}
