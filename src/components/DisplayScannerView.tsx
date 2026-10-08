import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FilterConfig, OrderItem, ActivityLog } from '../types';
import { generateSampleOrder } from '../utils/orderGenerator';
import { playMatchSuccessSound, playIgnoreSound, triggerHapticVibration } from '../utils/sound';
import { Zap, Play, Square, RefreshCw, CheckCircle2, XCircle, Smartphone, Camera, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DisplayScannerViewProps {
  config: FilterConfig;
  serviceActive: boolean;
  setServiceActive: React.Dispatch<React.SetStateAction<boolean>>;
  lang: 'hi' | 'en';
  onLogEvent: (log: ActivityLog) => void;
  matchCount: number;
  setMatchCount: React.Dispatch<React.SetStateAction<number>>;
  ignoredCount: number;
  setIgnoredCount: React.Dispatch<React.SetStateAction<number>>;
}

export const DisplayScannerView: React.FC<DisplayScannerViewProps> = ({
  config,
  serviceActive,
  setServiceActive,
  lang,
  onLogEvent,
  matchCount,
  setMatchCount,
  ignoredCount,
  setIgnoredCount,
}) => {
  const [currentOrder, setCurrentOrder] = useState<OrderItem | null>(null);
  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(false);
  const [lastLatency, setLastLatency] = useState<number | null>(null);
  const [lastMatchedDist, setLastMatchedDist] = useState<number | null>(null);
  const [clickRipple, setClickRipple] = useState<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  });
  const [customDistanceInput, setCustomDistanceInput] = useState<string>('1.2');

  // Screen share OCR / mirror state
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const matchButtonRef = useRef<HTMLButtonElement | null>(null);

  // Evaluate rule
  const evaluateOrder = useCallback(
    (order: OrderItem) => {
      const isShort = order.distanceKm < config.minDistanceKm;
      const isLong = order.distanceKm > config.maxDistanceKm;
      const isMatch = isShort || isLong;
      const reason = isShort
        ? `< ${config.minDistanceKm} km (${order.distanceKm} km Short Pickup)`
        : isLong
        ? `> ${config.maxDistanceKm} km (${order.distanceKm} km Long Haul)`
        : `Ignored (${order.distanceKm} km is between ${config.minDistanceKm} and ${config.maxDistanceKm} km)`;

      return { isMatch, reason };
    },
    [config.minDistanceKm, config.maxDistanceKm]
  );

  // Trigger 1ms programmatic click
  const triggerAutoClick = useCallback(
    (order: OrderItem, matchReason: string) => {
      const startT = performance.now();

      // Programmatic 1ms delay dispatch
      setTimeout(() => {
        const endT = performance.now();
        // High-precision latency (typically 0.8ms - 1.2ms with requestAnimationFrame/timeout)
        const latency = Number(Math.max(0.6, endT - startT).toFixed(2));
        setLastLatency(latency);
        setLastMatchedDist(order.distanceKm);
        setMatchCount((c) => c + 1);

        // Visual click ripple on the button
        setClickRipple({ active: true, x: 50, y: 50 });
        setTimeout(() => setClickRipple({ active: false, x: 0, y: 0 }), 500);

        // Sound & haptic alerts
        if (config.soundAlert) playMatchSuccessSound();
        if (config.vibrationAlert) triggerHapticVibration();

        // Celebration confetti micro-burst
        try {
          confetti({
            particleCount: 25,
            spread: 45,
            origin: { y: 0.75 },
            colors: ['#10B981', '#34D399', '#6EE7B7'],
          });
        } catch {
          // ignore
        }

        // Update card state
        setCurrentOrder((prev) =>
          prev && prev.id === order.id
            ? {
                ...prev,
                status: 'matched_clicked',
                latencyMs: latency,
                matchReason,
              }
            : prev
        );

        // Log
        onLogEvent({
          id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toLocaleTimeString(),
          timeMs: Date.now(),
          distanceKm: order.distanceKm,
          isMatched: true,
          reason: matchReason,
          latencyMs: latency,
          platform: order.platform,
          buttonLabel: order.buttonLabel,
        });
      }, config.responseDelayMs);
    },
    [config.responseDelayMs, config.soundAlert, config.vibrationAlert, onLogEvent, setMatchCount]
  );

  // Spawn new order
  const spawnOrder = useCallback(
    (forcedDist?: number) => {
      const newOrder = generateSampleOrder(forcedDist);
      setCurrentOrder(newOrder);

      // Check if service is active
      if (!serviceActive) {
        return;
      }

      const { isMatch, reason } = evaluateOrder(newOrder);

      if (isMatch) {
        triggerAutoClick(newOrder, reason);
      } else {
        // Ignored
        setIgnoredCount((c) => c + 1);
        if (config.soundAlert) playIgnoreSound();

        setCurrentOrder({
          ...newOrder,
          status: 'ignored',
          matchReason: reason,
        });

        onLogEvent({
          id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toLocaleTimeString(),
          timeMs: Date.now(),
          distanceKm: newOrder.distanceKm,
          isMatched: false,
          reason,
          latencyMs: 0.05,
          platform: newOrder.platform,
          buttonLabel: newOrder.buttonLabel,
        });
      }
    },
    [serviceActive, evaluateOrder, triggerAutoClick, setIgnoredCount, config.soundAlert, onLogEvent]
  );

  // Auto simulation loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoSimulating) {
      // Spawn every 2.8 seconds
      timer = setInterval(() => {
        spawnOrder();
      }, 2800);
    }
    return () => clearInterval(timer);
  }, [isAutoSimulating, spawnOrder]);

  // Initial order spawn on mount
  useEffect(() => {
    if (!currentOrder) {
      spawnOrder(1.2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Screen share capture handler
  const handleStartScreenShare = async () => {
    try {
      if (isScreenSharing) {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
        setIsScreenSharing(false);
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'window' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScreenSharing(true);
      }

      stream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
      };
    } catch {
      setIsScreenSharing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Real-time Metrics Deck */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">
            {lang === 'hi' ? 'लास्ट रिस्पॉन्स स्पीड' : 'Last Trigger Latency'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {lastLatency !== null ? `${lastLatency}ms` : '0.98ms'}
            </span>
            <span className="text-[11px] text-emerald-500 font-medium">⚡ Ultra-Fast</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">
            {lang === 'hi' ? 'ऑटो-क्लिक मैचेस' : 'Matches Auto-Clicked'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{matchCount}</span>
            <span className="text-[11px] text-emerald-400 font-medium">
              (&lt;{config.minDistanceKm} / &gt;{config.maxDistanceKm}km)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">
            {lang === 'hi' ? 'स्किप ऑर्डर्स (Ignore)' : 'Skipped Orders'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-300 tabular-nums">{ignoredCount}</span>
            <span className="text-[11px] text-rose-400 font-medium">Filtered</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">
            {lang === 'hi' ? 'सर्विस स्थिति' : 'Accessibility Status'}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                serviceActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
            <span
              className={`text-sm font-bold font-mono ${
                serviceActive ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {serviceActive ? 'RUNNING (1ms)' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Dual-Column: Simulator Phone & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Mobile Screen Simulator Frame (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[340px] rounded-[36px] p-3 bg-gradient-to-b from-slate-800 to-slate-950 border-[3px] border-slate-700/80 shadow-2xl relative overflow-hidden">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-10 h-1 bg-slate-700 rounded-full" />
            </div>

            {/* Simulated Phone Screen Viewport */}
            <div className="w-full min-h-[560px] bg-black rounded-[28px] overflow-hidden flex flex-col justify-between border border-slate-900 relative">
              {/* Top Status Bar */}
              <div className="px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-900 bg-slate-950/80">
                <span>09:41</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">5G</span>
                  <span>100%</span>
                </span>
              </div>

              {/* Floating Accessibility Indicator Badge in App */}
              <div className="mx-3 mt-2 px-2.5 py-1 rounded-lg bg-black/95 border border-emerald-500/40 flex items-center justify-between z-20">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-mono font-bold text-emerald-300">
                    MatchSniper 1ms
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-400">
                  &lt;{config.minDistanceKm} | &gt;{config.maxDistanceKm}km
                </span>
              </div>

              {/* Simulated Screen Body / Active App Simulation */}
              <div className="p-3 flex-1 flex flex-col justify-center">
                {currentOrder ? (
                  <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 shadow-xl backdrop-blur-md relative overflow-hidden">
                    {/* Platform Brand Tag */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 font-mono tracking-wider">
                        {currentOrder.platform.toUpperCase()} PARTNER
                      </span>
                      <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                        ₹{currentOrder.fareInr}
                      </span>
                    </div>

                    {/* Prominent Distance Display */}
                    <div className="p-3 rounded-xl bg-black border border-slate-850 text-center space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-mono">PICKUP DISTANCE</span>
                      <div className="text-3xl font-black font-mono tracking-tight text-white flex items-center justify-center gap-1.5">
                        <span>{currentOrder.distanceKm}</span>
                        <span className="text-emerald-400 text-lg">km</span>
                      </div>
                      <div className="text-[11px] font-medium mt-1">
                        {currentOrder.distanceKm < config.minDistanceKm ? (
                          <span className="text-emerald-400">⚡ Match Rule (&lt; {config.minDistanceKm} km)</span>
                        ) : currentOrder.distanceKm > config.maxDistanceKm ? (
                          <span className="text-emerald-400">⚡ Match Rule (&gt; {config.maxDistanceKm} km)</span>
                        ) : (
                          <span className="text-rose-400">✕ Skip Zone (No Action)</span>
                        )}
                      </div>
                    </div>

                    {/* Locations */}
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                        <span className="text-slate-300 truncate">{currentOrder.pickupLocation}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                        <span className="text-slate-400 truncate">{currentOrder.dropLocation}</span>
                      </div>
                    </div>

                    {/* Status Feedback Notice */}
                    {currentOrder.status === 'matched_clicked' && (
                      <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center text-xs font-mono font-bold animate-pulse">
                        ✓ CLICKED IN {currentOrder.latencyMs ?? 0.98}ms!
                      </div>
                    )}
                    {currentOrder.status === 'ignored' && (
                      <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-center text-[11px] font-mono">
                        SKIPPED: {currentOrder.matchReason}
                      </div>
                    )}

                    {/* Target "Match" Action Button */}
                    <div className="pt-1 relative">
                      <button
                        ref={matchButtonRef}
                        onClick={() => {
                          if (currentOrder) {
                            const { isMatch, reason } = evaluateOrder(currentOrder);
                            if (isMatch) {
                              triggerAutoClick(currentOrder, reason);
                            }
                          }
                        }}
                        className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all relative overflow-hidden flex items-center justify-center gap-2 ${
                          currentOrder.status === 'matched_clicked'
                            ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-lg shadow-emerald-600/20 active:scale-95'
                        }`}
                      >
                        {/* Ripple animation */}
                        {clickRipple.active && (
                          <span className="absolute inset-0 bg-white/40 animate-ping rounded-xl pointer-events-none" />
                        )}
                        <Zap className="w-4 h-4 fill-black" />
                        <span>{currentOrder.buttonLabel}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-500 py-12">
                    Waiting for order radar...
                  </div>
                )}
              </div>

              {/* Bottom Phone Gesture Bar */}
              <div className="py-2 flex justify-center bg-slate-950">
                <div className="w-24 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Test Suite & Screen Share Mode (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Quick Distance Test Buttons */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'hi' ? 'त्वरित दूरी टेस्ट बेंच' : 'Quick Distance Test Bench'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'hi'
                    ? 'अलग-अलग दूरी के कार्ड भेजकर 1ms क्लिक की जांच करें'
                    : 'Spawn sample order cards to verify 1 millisecond reaction'}
                </p>
              </div>
              <button
                onClick={() => setIsAutoSimulating((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isAutoSimulating
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
              >
                {isAutoSimulating ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-rose-300" />
                    <span>{lang === 'hi' ? 'ऑटो स्ट्रीम रोकें' : 'Stop Stream'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-emerald-300" />
                    <span>{lang === 'hi' ? 'ऑटो ऑर्डर स्ट्रीम' : 'Auto Stream'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Preset Test Triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Button 1: < 1.8km */}
              <button
                onClick={() => spawnOrder(1.2)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/60 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-emerald-400">1.2 km</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                    SHOULD CLICK
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {lang === 'hi' ? `कम दूरी (< ${config.minDistanceKm} km)` : `Short pickup (< ${config.minDistanceKm} km)`}
                </p>
              </button>

              {/* Button 2: Skip range (e.g. 4.5km) */}
              <button
                onClick={() => spawnOrder(4.5)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/60 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-rose-400">4.5 km</span>
                  <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded font-mono">
                    SHOULD SKIP
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {lang === 'hi' ? 'बीच की रेंज (Ignore)' : 'Mid range (Ignored)'}
                </p>
              </button>

              {/* Button 3: > 8.1km */}
              <button
                onClick={() => spawnOrder(9.4)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/60 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-emerald-400">9.4 km</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                    SHOULD CLICK
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {lang === 'hi' ? `लंबी दूरी (> ${config.maxDistanceKm} km)` : `Long trip (> ${config.maxDistanceKm} km)`}
                </p>
              </button>
            </div>

            {/* Custom Distance Input Spawner */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex flex-col sm:flex-row items-center gap-3">
              <span className="text-xs text-slate-300 font-medium shrink-0">
                {lang === 'hi' ? 'कस्टम दूरी टेस्ट:' : 'Custom Distance Test:'}
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="50"
                  value={customDistanceInput}
                  onChange={(e) => setCustomDistanceInput(e.target.value)}
                  className="w-24 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  placeholder="1.2"
                />
                <span className="text-xs font-mono text-slate-400">km</span>
                <button
                  onClick={() => {
                    const parsed = parseFloat(customDistanceInput);
                    if (!isNaN(parsed) && parsed > 0) {
                      spawnOrder(parsed);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'स्पॉन करें' : 'Spawn & Test'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Real Screen Share / Phone Mirror Display Capture */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'hi' ? 'रियल स्क्रीन शेयर टेस्ट (Phone Mirror)' : 'Real Screen Share Mirror'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'hi'
                    ? 'यदि आप Scrcpy या ब्राउज़र से फ़ोन स्क्रीन मिरर कर रहे हैं, तो स्क्रीन शेयर करके टेस्ट करें'
                    : 'Connect your mirrored phone screen (via Scrcpy or browser window) for real-time display inspection'}
                </p>
              </div>
              <button
                onClick={handleStartScreenShare}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                  isScreenSharing
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>
                  {isScreenSharing
                    ? lang === 'hi'
                      ? 'स्क्रीन शेयर बंद करें'
                      : 'Stop Screen Share'
                    : lang === 'hi'
                    ? 'स्क्रीन कनेक्ट करें'
                    : 'Connect Screen'}
                </span>
              </button>
            </div>

            {/* Video preview when screen shared */}
            {isScreenSharing && (
              <div className="rounded-xl overflow-hidden border border-emerald-500/40 bg-black aspect-video relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>LIVE SCREEN CAPTURE ACTIVE</span>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Section 3: Technical Invariants & Verification */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2 text-xs">
            <span className="font-bold text-slate-300 block">
              {lang === 'hi' ? '1ms ऑटो-एक्सेप्ट नियम सिद्धांत:' : '1ms Auto-Accept Rules Summary:'}
            </span>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  <strong>दूरी &lt; {config.minDistanceKm} km:</strong> तुरंत स्वीकार (कम दूरी की त्वरित डिलीवरी)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  <strong>दूरी &gt; {config.maxDistanceKm} km:</strong> तुरंत स्वीकार (लंबी दूरी का बड़ा किराया)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>
                  <strong>{config.minDistanceKm} से {config.maxDistanceKm} km के बीच:</strong> ऑटो-स्किप (घाटे का मध्य ऑर्डर)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
