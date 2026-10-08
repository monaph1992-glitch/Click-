import React, { useState } from 'react';
import { FilterConfig } from '../types';
import { Sliders, BatteryCharging, Zap, ShieldCheck, Check, Plus, Trash2, Cpu } from 'lucide-react';

interface RulesSettingsViewProps {
  config: FilterConfig;
  setConfig: React.Dispatch<React.SetStateAction<FilterConfig>>;
  lang: 'hi' | 'en';
}

export const RulesSettingsView: React.FC<RulesSettingsViewProps> = ({
  config,
  setConfig,
  lang,
}) => {
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    const trimmed = newKeyword.trim();
    if (!config.targetKeywords.includes(trimmed)) {
      setConfig((prev) => ({
        ...prev,
        targetKeywords: [...prev.targetKeywords, trimmed],
      }));
    }
    setNewKeyword('');
  };

  const handleRemoveKeyword = (keyword: string) => {
    setConfig((prev) => ({
      ...prev,
      targetKeywords: prev.targetKeywords.filter((k) => k !== keyword),
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-950 border border-slate-800/80 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'एक्टिव ट्रिगर कंडीशन' : 'Active Trigger Conditions'}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {lang === 'hi'
                ? `दूरी: ${config.minDistanceKm} km से कम YA ${config.maxDistanceKm} km से ज़्यादा`
                : `Distance: < ${config.minDistanceKm} km OR > ${config.maxDistanceKm} km`}
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {lang === 'hi'
                ? `स्क्रीन पर जैसे ही यह दूरी दिखेगी, 1 millisecond के भीतर "Match" बटन पर अपने आप ऑटो-क्लिक हो जाएगा। बीच की दूरी (${config.minDistanceKm} - ${config.maxDistanceKm} km) नज़रअंदाज़ (skip) रहेगी।`
                : `Instant click dispatched in 1ms as soon as distance matches. Orders between ${config.minDistanceKm} km and ${config.maxDistanceKm} km are automatically filtered and ignored.`}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl shrink-0 self-start md:self-auto">
            <span className="text-2xl font-black text-emerald-400 font-mono">{config.responseDelayMs}ms</span>
            <span className="text-xs text-emerald-300 font-medium leading-tight">
              {lang === 'hi' ? 'अल्ट्रा-फास्ट\nक्लिक रिस्पॉन्स' : 'Ultra-Fast\nClick Response'}
            </span>
          </div>
        </div>

        {/* Visual Distance Spectrum Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/60">
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="text-emerald-400 font-semibold">0.0 km</span>
            <span className="text-emerald-400 font-semibold">{config.minDistanceKm} km (Cutoff 1)</span>
            <span className="text-rose-400 font-semibold">मध्य रेंज (Skip Zone)</span>
            <span className="text-emerald-400 font-semibold">{config.maxDistanceKm} km (Cutoff 2)</span>
            <span className="text-emerald-400 font-semibold">20.0+ km</span>
          </div>

          <div className="h-6 w-full rounded-lg bg-slate-950 border border-slate-800 p-0.5 flex overflow-hidden">
            {/* Zone 1: Green Trigger (< 1.8km) */}
            <div
              style={{ width: `${Math.min(100, (config.minDistanceKm / 12) * 100)}%` }}
              className="h-full bg-emerald-500/30 border-r border-emerald-400/50 flex items-center justify-center text-[10px] font-bold text-emerald-300 font-mono"
            >
              ⚡ AUTO MATCH
            </div>

            {/* Zone 2: Red Ignored (1.8km to 8.1km) */}
            <div
              style={{
                width: `${Math.max(
                  10,
                  Math.min(80, ((config.maxDistanceKm - config.minDistanceKm) / 12) * 100)
                )}%`,
              }}
              className="h-full bg-rose-950/40 border-r border-rose-500/40 flex items-center justify-center text-[10px] font-medium text-rose-400 font-mono"
            >
              ✕ IGNORE / SKIP
            </div>

            {/* Zone 3: Green Trigger (> 8.1km) */}
            <div className="flex-1 h-full bg-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-300 font-mono">
              ⚡ AUTO MATCH
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Distance Threshold Tuning */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {lang === 'hi' ? 'दूरी थ्रेसहोल्ड सेटिंग्स' : 'Distance Threshold Tuning'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'hi' ? 'न्यूनतम व अधिकतम सीमा तय करें' : 'Configure low and high distance limits'}
              </p>
            </div>
          </div>

          {/* Condition 1: Min Distance */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-850">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">
                {lang === 'hi' ? 'शर्त 1: कम दूरी (< Min Km)' : 'Condition 1: Short Distance (< Min Km)'}
              </span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                &lt; {config.minDistanceKm} km
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={config.minDistanceKm}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  minDistanceKm: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>0.5 km</span>
              <span className="text-slate-400">डिफ़ॉल्ट: 1.8 km</span>
              <span>4.0 km</span>
            </div>
          </div>

          {/* Condition 2: Max Distance */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-850">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">
                {lang === 'hi' ? 'शर्त 2: लंबी दूरी (> Max Km)' : 'Condition 2: Long Distance (> Max Km)'}
              </span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                &gt; {config.maxDistanceKm} km
              </span>
            </div>
            <input
              type="range"
              min="5.0"
              max="20.0"
              step="0.1"
              value={config.maxDistanceKm}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  maxDistanceKm: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>5.0 km</span>
              <span className="text-slate-400">डिफ़ॉल्ट: 8.1 km</span>
              <span>20.0 km</span>
            </div>
          </div>

          {/* Response Latency */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-850">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">
                {lang === 'hi' ? 'क्लिक डिस्पैच लेटेंसी' : 'Click Dispatch Latency'}
              </span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                {config.responseDelayMs} ms
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={config.responseDelayMs}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  responseDelayMs: parseInt(e.target.value, 10),
                }))
              }
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>1 ms (Instant)</span>
              <span>10 ms</span>
              <span>25 ms</span>
            </div>
          </div>
        </div>

        {/* Section 2: Target Button & Keywords */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {lang === 'hi' ? 'टारगेट बटन कीवर्ड्स' : 'Target Button Keywords'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'hi'
                  ? 'स्क्रीन पर इस नाम वाले बटन पर क्लिक होगा'
                  : 'Screen button labels to automatically tap'}
              </p>
            </div>
          </div>

          {/* Keywords List */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 min-h-12 p-3 rounded-xl bg-slate-950 border border-slate-850">
              {config.targetKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-slate-900 border border-slate-800 text-emerald-300"
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{kw}</span>
                  {config.targetKeywords.length > 1 && (
                    <button
                      onClick={() => handleRemoveKeyword(kw)}
                      className="text-slate-500 hover:text-rose-400 ml-1 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            {/* Add Keyword Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={lang === 'hi' ? 'नया कीवर्ड जोड़ें (उदा. Book, Order)' : 'Add label (e.g. Match, Book)'}
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                onClick={handleAddKeyword}
                className="px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'जोड़ें' : 'Add'}</span>
              </button>
            </div>
          </div>

          {/* Feedback options */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-850">
              <div className="text-xs">
                <p className="font-semibold text-slate-200">
                  {lang === 'hi' ? 'ऑडियो अलर्ट (Beep Sound)' : 'Sound Alert on Match'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {lang === 'hi' ? '1ms क्लिक होते ही तुरंत बीप आवाज़' : 'Zero-delay Web Audio confirmation chime'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.soundAlert}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, soundAlert: e.target.checked }))
                }
                className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-850">
              <div className="text-xs">
                <p className="font-semibold text-slate-200">
                  {lang === 'hi' ? 'वाइब्रेशन फीडबैक' : 'Haptic Vibration'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {lang === 'hi' ? 'मैच होने पर फोन वाइब्रेट करे' : 'Instant mobile tactile pulse on trigger'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.vibrationAlert}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, vibrationAlert: e.target.checked }))
                }
                className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Battery Optimization & Display Aadharit Engine */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <BatteryCharging className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {lang === 'hi' ? 'बैटरी ऑप्टिमाइजेशन व डिस्प्ले मोड' : 'Battery Optimization & Display Mode'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'hi'
                ? 'बैकग्राउंड में चलने के लिए न्यूनतम बैटरी खपत (OLED Black + Event Driven Scan)'
                : 'Background execution with minimal battery drain profile'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Item 1: AMOLED True Black */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-200">
                  {lang === 'hi' ? 'AMOLED ट्रू ब्लैक' : 'AMOLED True Black'}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  0% OLED Power
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {lang === 'hi'
                  ? 'OLED स्क्रीन्स पर काले पिक्सल बंद रहते हैं, जिससे पूरे दिन चलने पर भी बैटरी नहीं उतरती।'
                  : 'Individual OLED pixels turn completely off during dark display overlay.'}
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-900">
              <span className="text-xs text-slate-400 font-mono">#000000 Mode</span>
              <input
                type="checkbox"
                checked={config.amoledMode}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, amoledMode: e.target.checked }))
                }
                className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Item 2: Event-Driven Scanning */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-200">
                  {lang === 'hi' ? 'इवेंट-आधारित स्कैन' : 'Event-Driven Scan'}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Zero CPU Idle
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {lang === 'hi'
                  ? 'लगातार स्क्रीन प्रोसेस नहीं होती; सिर्फ जब नया राइड कार्ड विंडो में आता है तभी 1ms में चेक करता है।'
                  : 'Only fires on TYPE_WINDOW_CONTENT_CHANGED events, consuming 0% CPU when screen is still.'}
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-900">
              <span className="text-xs text-slate-400 font-mono">Eco Loop</span>
              <input
                type="checkbox"
                checked={config.batteryEcoScan}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, batteryEcoScan: e.target.checked }))
                }
                className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Item 3: Auto Sleep on Screen Off */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-200">
                  {lang === 'hi' ? 'स्क्रीन ऑफ ऑटो-पॉज़' : 'Pause on Screen Off'}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Sleep Guard
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {lang === 'hi'
                  ? 'स्क्रीन लॉक या बंद होने पर एक्सेसिबिलिटी स्कैनर सो जाएगा ताकि जेब में बैटरी सुरक्षित रहे।'
                  : 'Suspends accessibility node scanning immediately when display turns off.'}
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-900">
              <span className="text-xs text-slate-400 font-mono">Auto Sleep</span>
              <input
                type="checkbox"
                checked={config.autoStopOnScreenOff}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, autoStopOnScreenOff: e.target.checked }))
                }
                className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
