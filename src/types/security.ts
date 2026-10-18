export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type Status = 'Awaiting action' | 'In progress' | 'Escalated to L2' | 'Closed';
export type Verdict = 'True Positive' | 'False Positive' | 'None';
export type AttackType = 'Slow Scan' | 'Port Scan' | 'Brute Force' | 'DoS' | 'DDoS' | 'Other';
export type DetectionMode = 'Signature' | 'Anomaly' | 'Both' | 'ML';
export type EnforcementAction = 'OVS_DROP' | 'IPTABLES_DROP' | 'QUARANTINE_VLAN';

export interface Alert {
  alert_id: string;
  timestamp: string; // e.g. "2026-09-29 13:05"
  alert_name: string;
  severity: Severity;
  status: Status;
  verdict: Verdict;
  assignee: string;
  attack_type: AttackType;
  src_ip: string;
  dest_host: string;
  dest_port: string;
  risk_score: number | string;
  confidence_score: number | string;
  action_taken: string;
  comment: string;
  detection: DetectionMode;
  enforcement: EnforcementAction[];
}

export interface ConnectionRecord {
  id: string;
  time: string;
  src_ip: string;
  dest_ip: string;
  port: number | string;
  duration: string;
}

export interface ConfusionMatrix {
  tn: number;
  fp: number;
  fn: number;
  tp: number;
}

export interface FeatureImportance {
  name: string;
  importance: number;
  raw: number;
}

export interface AttackRecall {
  name: string;
  correct: number;
  total: number;
  recall: number;
}

export interface ModelMetrics {
  algorithm: string;
  version: string;
  dataset: string;
  split: string;
  confusion_matrix: ConfusionMatrix;
  top_features: FeatureImportance[];
  recall_per_attack: AttackRecall[];
}

export interface ThresholdSettings {
  block_threshold: number;
  quarantine_threshold: number;
  ml_confidence_threshold: number;
}

export interface NotificationItem {
  id: string;
  alert_id: string;
  title: string;
  severity: Severity;
  timestamp: string;
  read: boolean;
}

export interface MitreAttackInfo {
  id: string;
  technique: string;
  tactic: string;
  subtechnique?: string;
  url: string;
}
