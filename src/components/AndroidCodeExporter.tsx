import React, { useState } from 'react';
import { ANDROID_FILES, CodeFile } from '../data/androidSource';
import { Download, Copy, Check, Terminal, ShieldAlert, Cpu, FileCode2, ExternalLink } from 'lucide-react';
import JSZip from 'jszip';

interface AndroidCodeExporterProps {
  lang: 'hi' | 'en';
  minDistance: number;
  maxDistance: number;
}

export const AndroidCodeExporter: React.FC<AndroidCodeExporterProps> = ({
  lang,
  minDistance,
  maxDistance,
}) => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(ANDROID_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  // Substitute current threshold values into the Kotlin service code dynamically
  const getProcessedContent = (file: CodeFile): string => {
    if (file.name === 'MatchAccessibilityService.kt') {
      return file.content
        .replace('var minThresholdKm: Double = 1.8', `var minThresholdKm: Double = ${minDistance}`)
        .replace('var maxThresholdKm: Double = 8.1', `var maxThresholdKm: Double = ${maxDistance}`);
    }
    return file.content;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getProcessedContent(selectedFile));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add all source files to the zip
      ANDROID_FILES.forEach((file) => {
        zip.file(file.path, getProcessedContent(file));
      });

      // Add README.md
      const readme = `# MatchSniper 1ms - Android Accessibility Service
Distance Auto-Clicker (< ${minDistance} km OR > ${maxDistance} km)
Created for ultra-fast background sniping with battery optimization.

## How to Build in Android Studio:
1. Open Android Studio -> New Project -> Import or Open this folder.
2. Build -> Build Bundle(s) / APK(s) -> Build APK(s).
3. Transfer apk to phone and install.

## Permissions to enable on device:
1. Accessibility Service: Settings -> Accessibility -> Installed Services -> MatchSniper -> ON
2. Overlay: Settings -> Apps -> MatchSniper -> Display over other apps -> Allow
3. Battery: Settings -> Apps -> MatchSniper -> Battery -> Unrestricted / No restrictions
`;
      zip.file('README.md', readme);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MatchSniper-Accessibility-Project.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate zip', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'एंड्रॉयड एक्सेसिबिलिटी सर्विस आर्किटेक्चर' : 'Android Accessibility Service Architecture'}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {lang === 'hi' ? 'एंड्रॉयड ऐप सोर्स कोड व इंस्टॉलेशन गाइड' : 'Production Android Source Code & Project Zip'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {lang === 'hi'
              ? 'बैकग्राउंड में चलने वाला संपूर्ण कोटलिन (Kotlin) एक्सेसिबिलिटी कोड, जो 1ms में AccessibilityNodeInfo स्कैन करके जेस्चर क्लिक डिस्पैच करता है।'
              : 'Complete Kotlin AccessibilityService repository with TYPE_APPLICATION_OVERLAY floating bubble and background battery whitelist.'}
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isZipping ? 'ज़िप फ़ाइल तैयार हो रही है...' : lang === 'hi' ? 'प्रोजेक्ट डाउनलोड करें (.ZIP)' : 'Download Project (.ZIP)'}</span>
        </button>
      </div>

      {/* Code Viewer & File Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left File List (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block px-1 mb-2">
            {lang === 'hi' ? 'प्रोजेक्ट फ़ाइलें' : 'Project Files'}
          </span>
          {ANDROID_FILES.map((file) => (
            <button
              key={file.name}
              onClick={() => setSelectedFile(file)}
              className={`w-full text-left p-3 rounded-xl transition-all border ${
                selectedFile.name === file.name
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-mono font-bold truncate">{file.name}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">{file.description}</p>
            </button>
          ))}
        </div>

        {/* Right Code Display (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          {/* Code Header Bar */}
          <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-mono">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>{selectedFile.path}</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">{lang === 'hi' ? 'कॉपी हो गया' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'कोड कॉपी करें' : 'Copy Code'}</span>
                </>
              )}
            </button>
          </div>

          {/* Code Text Body */}
          <div className="p-4 overflow-x-auto max-h-[500px] text-xs font-mono leading-relaxed text-slate-300">
            <pre className="selection:bg-emerald-500/30 selection:text-emerald-200">
              {getProcessedContent(selectedFile)}
            </pre>
          </div>
        </div>
      </div>

      {/* Step-by-Step Setup Guide in Hindi & English */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emerald-400" />
          <span>
            {lang === 'hi'
              ? 'फ़ोन में बैकग्राउंड व एक्सेसिबिलिटी सेटिंग्स (महत्वपूर्ण गाइड)'
              : 'Mobile Background & Accessibility Setup Guide'}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">1</span>
              <span>{lang === 'hi' ? 'एक्सेसिबिलिटी ऑन करें' : 'Accessibility Permission'}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'hi'
                ? 'फ़ोन Settings -> Accessibility (पहुंच) -> Installed Apps/Services -> MatchSniper 1ms पर जाकर "Allow / चालू" करें।'
                : 'Navigate to Settings -> Accessibility -> Installed Services -> MatchSniper 1ms -> Toggle ON.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">2</span>
              <span>{lang === 'hi' ? 'डिस्प्ले ओवर ऐप्स (HUD)' : 'Display Over Other Apps'}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'hi'
                ? 'Settings -> Apps -> MatchSniper -> "Display over other apps" (अन्य ऐप्स के ऊपर दिखाएं) की अनुमति दें ताकि फ्लोटिंग बटन स्क्रीन पर दिखे।'
                : 'Grant "Draw over other apps" permission so the floating AMOLED trigger HUD can overlay delivery apps.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">3</span>
              <span>{lang === 'hi' ? 'बैटरी ऑप्टिमाइज़ेशन: Unrestricted' : 'Battery: Unrestricted'}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'hi'
                ? 'Xiaomi (MIUI), Vivo, Oppo, Realme, Samsung में बैटरी सेवर इसे बंद न करे, इसलिए Battery -> "No restrictions / असीमित" चुनें।'
                : 'Set App Battery Usage to "Unrestricted / Don’t optimize" so OEM battery killers do not terminate the service in background.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
