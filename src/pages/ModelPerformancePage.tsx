import React from 'react';
import { 
  AlertTriangle, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Database, 
  BarChart3, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { Card } from '../components/common/Card';
import { MODEL_METRICS } from '../data/data';

export const ModelPerformancePage: React.FC = () => {
  const { truePositiveCount, falsePositiveCount, mlDetectedCount } = useSecurity();

  // Metrics from test set
  // TN = 3395, FP = 6, FN = 30, TP = 1586
  // Total = 5017
  // Accuracy = (3395 + 1586) / 5017 = 4981 / 5017 = 99.282% -> 99.3%
  // Precision = 1586 / (1586 + 6) = 1586 / 1592 = 99.623% -> 99.6%
  // Recall = 1586 / (1586 + 30) = 1586 / 1616 = 98.143% -> 98.1%
  // F1 = 2 * (P * R) / (P + R) = 98.878% -> 98.9%
  // FP = 6 / 3401 (3395 TN + 6 FP = 3401 normal)

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <span className="p-2 rounded-lg bg-amber-500/20 text-accent-amber shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold text-amber-500 dark:text-amber-400">
                Sample data notice
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Sample data
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              These numbers come from <code className="font-mono text-accent-amber font-semibold">synthetic_zeek_conn.csv</code> (synthetic). Replace with a real evaluation (IoT-23 / CIC-IDS2017 / your own Zeek logs) before presenting results.
            </p>
          </div>
        </div>
      </div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Accuracy */}
        <Card className="p-4">
          <span className="text-xs font-medium text-slate-500 dark:text-[#94a3bb] block mb-1">
            Accuracy
          </span>
          <div className="text-2xl font-bold font-mono text-accent-green">
            99.3%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-[#94a3bb] mt-1 block">
            Overall classification
          </span>
        </Card>

        {/* KPI 2: Precision */}
        <Card className="p-4">
          <span className="text-xs font-medium text-slate-500 dark:text-[#94a3bb] block mb-1">
            Precision
          </span>
          <div className="text-2xl font-bold font-mono text-accent-blue">
            99.6%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-[#94a3bb] mt-1 block">
            True attacks / flagged
          </span>
        </Card>

        {/* KPI 3: Recall */}
        <Card className="p-4">
          <span className="text-xs font-medium text-slate-500 dark:text-[#94a3bb] block mb-1">
            Recall
          </span>
          <div className="text-2xl font-bold font-mono text-accent-purple">
            98.1%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-[#94a3bb] mt-1 block">
            Attacks caught / total
          </span>
        </Card>

        {/* KPI 4: F1 Score */}
        <Card className="p-4">
          <span className="text-xs font-medium text-slate-500 dark:text-[#94a3bb] block mb-1">
            F1 score
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#e6ebf5]">
            98.9%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-[#94a3bb] mt-1 block">
            Harmonic mean
          </span>
        </Card>

        {/* KPI 5: False Positives */}
        <Card className="p-4">
          <span className="text-xs font-medium text-slate-500 dark:text-[#94a3bb] block mb-1">
            False positives
          </span>
          <div className="text-2xl font-bold font-mono text-accent-amber">
            6 <span className="text-xs font-normal text-slate-400">/ 3401</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-[#94a3bb] mt-1 block font-mono">
            0.18% FP test rate
          </span>
        </Card>
      </div>

      {/* Row of 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Model metadata */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-accent-blue" />
              Model Architecture & Training
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1f2b42]/60">
                <span className="text-slate-500 dark:text-[#94a3bb]">Algorithm</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{MODEL_METRICS.algorithm}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1f2b42]/60">
                <span className="text-slate-500 dark:text-[#94a3bb]">Version</span>
                <span className="font-mono font-semibold text-accent-blue">{MODEL_METRICS.version}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1f2b42]/60">
                <span className="text-slate-500 dark:text-[#94a3bb]">Dataset</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{MODEL_METRICS.dataset}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-[#94a3bb]">Split</span>
                <span className="text-slate-800 dark:text-slate-200 text-right">{MODEL_METRICS.split}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1f2b42]/60 text-[11px] text-slate-400">
            Exported from scikit-learn pipeline container.
          </div>
        </Card>

        {/* Card 2: Confusion matrix (test set) 2x2 Heatmap */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-accent-purple" />
              Confusion matrix (test set)
            </h3>

            {/* Matrix Container */}
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-center">
                {/* True Negative */}
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                    True Negative (TN)
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    3,395
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Normal correctly passed
                  </span>
                </div>

                {/* False Positive */}
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                    False Positive (FP)
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    6
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                    Normal falsely alerted
                  </span>
                </div>

                {/* False Negative */}
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
                    False Negative (FN)
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    30
                  </span>
                  <span className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                    Attacks missed (slow scan)
                  </span>
                </div>

                {/* True Positive */}
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                    True Positive (TP)
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    1,586
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Attacks detected
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-500 dark:text-[#94a3bb] italic text-center">
            Rows: actual normal / attack. Columns: predicted normal / attack.
          </p>
        </Card>

        {/* Card 3: Analyst feedback loop */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-accent-blue" />
              Analyst feedback loop
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-accent-green" />
                  Closed as true positive
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {truePositiveCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <XCircle className="w-4 h-4 text-accent-red" />
                  Closed as false positive
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {falsePositiveCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <Cpu className="w-4 h-4 text-accent-blue" />
                  Alerts found by ML
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {mlDetectedCount}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42] text-[11px] text-slate-600 dark:text-[#94a3bb] leading-relaxed">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">
              Continuous Active Learning:
            </span>
            Every verdict is a new label. Export them and retrain periodically; validate the new model before activating it.
          </div>
        </Card>
      </div>

      {/* Row of 2 Cards: Top Features & Recall Per Attack */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Top Features */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent-blue" />
              Top features (Random Forest feature importance)
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94a3bb]">
              Relative Gini importance of Zeek flow aggregation features
            </p>
          </div>

          <div className="space-y-3">
            {MODEL_METRICS.top_features.map((feat) => {
              const pct = Math.round(feat.importance * 100);
              return (
                <div key={feat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {feat.name}
                    </span>
                    <span className="text-accent-blue font-bold">
                      {feat.importance.toFixed(2)} <span className="text-[11px] text-slate-400 font-normal">({feat.raw})</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-accent-blue rounded-full transition-all duration-500"
                      style={{ width: `${(feat.importance / 0.26) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Card 2: Recall per attack type */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2">
              <Database className="w-4 h-4 text-accent-green" />
              Recall per attack type (correct / total)
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94a3bb]">
              Sensitivity breakdown across malicious traffic families
            </p>
          </div>

          <div className="space-y-3">
            {MODEL_METRICS.recall_per_attack.map((atk) => {
              const isLowRecall = atk.recall < 90;
              const barColor = isLowRecall ? 'bg-accent-amber' : 'bg-accent-green';
              const textColor = isLowRecall ? 'text-accent-amber' : 'text-accent-green';

              return (
                <div key={atk.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      {atk.name}
                      {isLowRecall && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Weak Class
                        </span>
                      )}
                    </span>
                    <span className={`font-mono font-bold ${textColor}`}>
                      {atk.recall.toFixed(1)}% <span className="text-[11px] text-slate-400 font-normal">({atk.correct}/{atk.total})</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${atk.recall}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-400">
            <span className="font-semibold block mb-0.5">Analyst Note on Slow Scan:</span>
            Slow Scan is the weakest class and the one the rules cannot catch.
          </div>
        </Card>
      </div>
    </div>
  );
};
