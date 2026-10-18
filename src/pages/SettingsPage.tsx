import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldAlert, 
  Sliders, 
  Database, 
  Sun, 
  Moon, 
  Check, 
  RotateCcw,
  Code2
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { Card } from '../components/common/Card';

export const SettingsPage: React.FC = () => {
  const { thresholds, updateThresholds, theme, toggleTheme } = useSecurity();

  const [blockThresh, setBlockThresh] = useState(thresholds.block_threshold);
  const [quarThresh, setQuarThresh] = useState(thresholds.quarantine_threshold);
  const [mlThresh, setMlThresh] = useState(thresholds.ml_confidence_threshold);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    updateThresholds({
      block_threshold: Number(blockThresh),
      quarantine_threshold: Number(quarThresh),
      ml_confidence_threshold: Number(mlThresh)
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    setBlockThresh(40);
    setQuarThresh(80);
    setMlThresh(0.80);
    updateThresholds({
      block_threshold: 40,
      quarantine_threshold: 80,
      ml_confidence_threshold: 0.80
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Card 1: Detection thresholds */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1f2b42] mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-accent-blue" />
              Detection thresholds
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94a3bb] mt-0.5">
              Tune automated mitigation cutoffs and ML probabilistic scoring parameters
            </p>
          </div>

          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#162238] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset defaults
          </button>
        </div>

        <form onSubmit={handleSaveThresholds} className="space-y-6">
          {/* Row 1: Block threshold */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42]">
            <div className="space-y-1 pr-4">
              <label htmlFor="block_thresh" className="text-xs font-bold text-slate-900 dark:text-[#e6ebf5] block">
                Block threshold
              </label>
              <p className="text-xs text-slate-500 dark:text-[#94a3bb]">
                Risk score above which ai_ips.py blocks automatically
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <input
                id="block_thresh"
                type="number"
                min="0"
                max="100"
                value={blockThresh}
                onChange={(e) => setBlockThresh(Number(e.target.value))}
                className="w-24 px-3 py-2 text-sm font-mono font-bold text-center rounded-lg bg-white dark:bg-[#111a2b] border border-slate-300 dark:border-[#1f2b42] text-slate-900 dark:text-white focus:border-accent-blue"
              />
              <span className="text-xs font-mono text-slate-400">/ 100</span>
            </div>
          </div>

          {/* Row 2: Quarantine threshold */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42]">
            <div className="space-y-1 pr-4">
              <label htmlFor="quar_thresh" className="text-xs font-bold text-slate-900 dark:text-[#e6ebf5] block">
                Quarantine threshold
              </label>
              <p className="text-xs text-slate-500 dark:text-[#94a3bb]">
                Risk score above which a source is moved to the Quarantine VLAN
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <input
                id="quar_thresh"
                type="number"
                min="0"
                max="100"
                value={quarThresh}
                onChange={(e) => setQuarThresh(Number(e.target.value))}
                className="w-24 px-3 py-2 text-sm font-mono font-bold text-center rounded-lg bg-white dark:bg-[#111a2b] border border-slate-300 dark:border-[#1f2b42] text-slate-900 dark:text-white focus:border-accent-blue"
              />
              <span className="text-xs font-mono text-slate-400">/ 100</span>
            </div>
          </div>

          {/* Row 3: ML confidence threshold */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42]">
            <div className="space-y-1 pr-4">
              <label htmlFor="ml_thresh" className="text-xs font-bold text-slate-900 dark:text-[#e6ebf5] block">
                ML confidence threshold
              </label>
              <p className="text-xs text-slate-500 dark:text-[#94a3bb]">
                Minimum classifier probability to add ML points: risk = signature + anomaly + round(ml_prob × 50)
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <input
                id="ml_thresh"
                type="number"
                step="0.05"
                min="0.0"
                max="1.0"
                value={mlThresh}
                onChange={(e) => setMlThresh(Number(e.target.value))}
                className="w-24 px-3 py-2 text-sm font-mono font-bold text-center rounded-lg bg-white dark:bg-[#111a2b] border border-slate-300 dark:border-[#1f2b42] text-slate-900 dark:text-white focus:border-accent-blue"
              />
              <span className="text-xs font-mono text-slate-400">prob</span>
            </div>
          </div>

          {/* Row 4: Theme Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42]">
            <div className="space-y-1 pr-4">
              <span className="text-xs font-bold text-slate-900 dark:text-[#e6ebf5] block">
                Theme
              </span>
              <p className="text-xs text-slate-500 dark:text-[#94a3bb]">
                Switch between light and dark mode
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#111a2b] border border-slate-300 dark:border-[#1f2b42] text-slate-800 dark:text-white hover:border-accent-blue transition-colors shadow-sm"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-accent-amber" />
                    <span>Dark mode active</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-accent-blue" />
                    <span>Light mode active</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {savedSuccess && (
                <span className="text-xs font-medium text-emerald-500 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Threshold configurations saved
                </span>
              )}
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-accent-blue text-white hover:bg-blue-600 shadow-sm transition-all"
            >
              Save changes
            </button>
          </div>
        </form>
      </Card>

      {/* Card 2: Data source */}
      <Card className="p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-[#1f2b42] mb-4">
          <Database className="w-5 h-5 text-accent-blue" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#e6ebf5]">
            Data source
          </h2>
        </div>

        <div className="space-y-4 text-xs text-slate-600 dark:text-[#94a3bb] leading-relaxed">
          <p>
            This prototype uses in-browser sample data. Connect it to a real backend by replacing the ALERTS array with <code className="font-mono text-accent-blue font-semibold">GET /api/alerts</code>.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42] space-y-2 font-mono text-[11px]">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold font-sans">
              <Code2 className="w-4 h-4 text-accent-blue" />
              REST API Contract Specification
            </div>
            <div className="space-y-1 text-slate-500 dark:text-slate-400">
              <div>• <span className="text-emerald-500 font-bold">GET</span> /api/alerts — Fetch all active alerts and queues</div>
              <div>• <span className="text-accent-blue font-bold">PATCH</span> /api/alerts/:id — Escalate alert or update analyst verdict/comments</div>
              <div>• <span className="text-accent-amber font-bold">POST</span> /api/alerts — Dispatch new alert from Zeek / Suricata sensor</div>
              <div>• <span className="text-emerald-500 font-bold">GET</span> /api/model/metrics — Fetch live classifier confusion matrix and feature importances</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
