import React from 'react';
import { ActivityLog } from '../types';
import { Trash2, History, CheckCircle, XCircle } from 'lucide-react';

interface LogStreamViewProps {
  logs: ActivityLog[];
  onClearLogs: () => void;
  lang: 'hi' | 'en';
}

export const LogStreamView: React.FC<LogStreamViewProps> = ({ logs, onClearLogs, lang }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {lang === 'hi' ? 'लाइव 1ms इवेंट हिस्ट्री' : 'Real-time 1ms Trigger Event Logs'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'hi' ? 'प्रत्येक स्क्रीन स्कैन और क्लिक का टाइमस्टैम्प रिकॉर्ड' : 'High-resolution timestamped audit log of all scans'}
            </p>
          </div>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'लॉग्स साफ़ करें' : 'Clear Logs'}</span>
          </button>
        )}
      </div>

      {/* Logs Table / List */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <p className="text-sm">
              {lang === 'hi' ? 'अभी कोई लॉग दर्ज नहीं हुआ है।' : 'No trigger events logged yet.'}
            </p>
            <p className="text-xs text-slate-600">
              {lang === 'hi'
                ? '"लाइव स्क्रीन टेस्ट" टैब में जाकर किसी दूरी पर क्लिक करें या ऑटो स्ट्रीम चालू करें।'
                : 'Visit "Live Screen Test" and test a sample order to populate real-time latency logs.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">समय (Time)</th>
                  <th className="py-3 px-4">प्लेटफ़ॉर्म</th>
                  <th className="py-3 px-4">स्क्रीन पर दूरी</th>
                  <th className="py-3 px-4">फ़ैसला (Action)</th>
                  <th className="py-3 px-4 text-right">लेटेंसी (1ms)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 tabular-nums">{log.timestamp}</td>
                    <td className="py-3 px-4 font-bold text-slate-200">{log.platform}</td>
                    <td className="py-3 px-4 font-bold text-white tabular-nums">
                      {log.distanceKm} km
                    </td>
                    <td className="py-3 px-4">
                      {log.isMatched ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>⚡ MATCH CLICKED ({log.reason})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span>SKIP ({log.reason})</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums">
                      {log.isMatched ? (
                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {log.latencyMs} ms
                        </span>
                      ) : (
                        <span className="text-slate-600">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
