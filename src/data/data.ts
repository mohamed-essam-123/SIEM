// TODO: This mock data is structured to be swapped for GET /api/alerts, PATCH /api/alerts/:id, POST /api/alerts, GET /api/model/metrics
import { Alert, AttackType, ConnectionRecord, DetectionMode, ModelMetrics } from '../types/security';

export const ATTACK_DESCRIPTIONS: Record<string, string> = {
  'Slow Scan': 'One source probed ports at a very low rate to stay under the velocity threshold. Only the ML classifier catches this pattern.',
  'Port Scan': 'A single source probed many destination ports in a very short time, which is typical of reconnaissance.',
  'Brute Force': 'Repeated short login attempts from one source against the same service, which may indicate password guessing.',
  'DoS': 'A single source sent a high rate of very short connections to one destination.',
  'DDoS': 'Many different sources sent a burst of short connections to the same destination.',
  'Other': 'Anomalous or suspicious traffic detected outside established baseline patterns.'
};

export const DETECTION_MODE_EXPLANATIONS: Record<DetectionMode, string> = {
  'ML': 'Flagged by the trained ML classifier (Zeek flow features) with no rule firing — typically stealthy behaviour such as a slow scan that stays under the rate threshold.',
  'Signature': 'Matched a known-bad pattern (e.g. a flagged port or a blacklisted signature).',
  'Anomaly': 'Flagged by behaviour: connection rate or timing was outside the normal baseline.',
  'Both': 'Matched a known signature and showed an abnormal pattern — both detectors agreed, which is why confidence is high.'
};

export const HOST_IP_MAP: Record<string, string> = {
  'WEB-DMZ-01': '172.16.133.10',
  'WIN-VICTIM-01': '172.16.132.10',
  'WIN-VICTIM-02': '172.16.132.11',
  'DB-SRV-01': '172.16.132.20'
};

export const INITIAL_ALERTS: Alert[] = [
  {
    alert_id: 'ALR-0034',
    timestamp: '2026-09-29 13:05',
    alert_name: 'Slow Port Scan (ML)',
    severity: 'Medium',
    status: 'Awaiting action',
    verdict: 'None',
    assignee: 'None',
    attack_type: 'Slow Scan',
    src_ip: '172.16.131.99',
    dest_host: 'WIN-VICTIM-02',
    dest_port: 'multiple',
    risk_score: 58,
    confidence_score: 0.87,
    action_taken: 'Blocked',
    comment: '',
    detection: 'ML',
    enforcement: ['OVS_DROP', 'IPTABLES_DROP']
  },
  {
    alert_id: 'ALR-0033',
    timestamp: '2026-09-29 12:55',
    alert_name: 'Stealth Scan below rate threshold',
    severity: 'High',
    status: 'Closed',
    verdict: 'True Positive',
    assignee: 'K.Adel (L2)',
    attack_type: 'Slow Scan',
    src_ip: '172.16.131.105',
    dest_host: 'DB-SRV-01',
    dest_port: 'multiple',
    risk_score: 64,
    confidence_score: 0.92,
    action_taken: 'Blocked',
    comment: 'Rules were silent; classifier caught it. Confirmed.',
    detection: 'ML',
    enforcement: ['OVS_DROP', 'IPTABLES_DROP']
  },
  {
    alert_id: 'ALR-0032',
    timestamp: '2026-09-29 12:41',
    alert_name: 'Distributed DoS Attack',
    severity: 'High',
    status: 'Awaiting action',
    verdict: 'None',
    assignee: 'None',
    attack_type: 'DDoS',
    src_ip: 'multiple (40 sources)',
    dest_host: 'WEB-DMZ-01',
    dest_port: '80',
    risk_score: 88,
    confidence_score: 0.91,
    action_taken: 'Blocked',
    comment: '',
    detection: 'Both',
    enforcement: ['OVS_DROP', 'IPTABLES_DROP']
  },
  {
    alert_id: 'ALR-0031',
    timestamp: '2026-09-29 12:18',
    alert_name: 'SSH Brute Force Attempt',
    severity: 'High',
    status: 'Escalated to L2',
    verdict: 'None',
    assignee: 'S.Nour (L2)',
    attack_type: 'Brute Force',
    src_ip: '172.16.131.50',
    dest_host: 'WIN-VICTIM-01',
    dest_port: '22',
    risk_score: 81,
    confidence_score: 0.94,
    action_taken: 'Blocked',
    comment: 'Successful login after 22 failures. Please check the account.',
    detection: 'Anomaly',
    enforcement: ['OVS_DROP', 'IPTABLES_DROP']
  },
  {
    alert_id: 'ALR-0030',
    timestamp: '2026-09-29 11:52',
    alert_name: 'Port Scan Detected',
    severity: 'Medium',
    status: 'Closed',
    verdict: 'False Positive',
    assignee: 'M.Samir (L1)',
    attack_type: 'Port Scan',
    src_ip: '172.16.134.5',
    dest_host: 'WEB-DMZ-01',
    dest_port: 'multiple',
    risk_score: 52,
    confidence_score: 0.66,
    action_taken: 'Monitored',
    comment: 'Scheduled vulnerability scan from the monitoring host. Not a threat.',
    detection: 'Signature',
    enforcement: []
  },
  {
    alert_id: 'ALR-0029',
    timestamp: '2026-09-29 11:30',
    alert_name: 'DoS Flood Against Server',
    severity: 'Critical',
    status: 'Closed',
    verdict: 'True Positive',
    assignee: 'K.Adel (L2)',
    attack_type: 'DoS',
    src_ip: '172.16.131.72',
    dest_host: 'WEB-DMZ-01',
    dest_port: '80',
    risk_score: 95,
    confidence_score: 0.97,
    action_taken: 'Quarantined',
    comment: 'Confirmed attack. Source quarantined.',
    detection: 'Both',
    enforcement: ['OVS_DROP', 'IPTABLES_DROP', 'QUARANTINE_VLAN']
  },
  {
    alert_id: 'ALR-0028',
    timestamp: '2026-09-29 11:05',
    alert_name: 'RDP Brute Force Attempt',
    severity: 'High',
    status: 'In progress',
    verdict: 'None',
    assignee: 'A.Hassan (L1)',
    attack_type: 'Brute Force',
    src_ip: '172.16.131.61',
    dest_host: 'DB-SRV-01',
    dest_port: '3389',
    risk_score: 76,
    confidence_score: 0.88,
    action_taken: 'Blocked',
    comment: 'Checking related connections.',
    detection: 'Signature',
    enforcement: ['OVS_DROP', 'IPTABLES_DROP']
  },
  {
    alert_id: 'ALR-0027',
    timestamp: '2026-09-29 10:48',
    alert_name: 'Port Scan Detected',
    severity: 'High',
    status: 'Awaiting action',
    verdict: 'None',
    assignee: 'None',
    attack_type: 'Port Scan',
    src_ip: '172.16.131.88',
    dest_host: 'WIN-VICTIM-02',
    dest_port: 'multiple',
    risk_score: 72,
    confidence_score: 0.90,
    action_taken: 'Blocked',
    comment: '',
    detection: 'Anomaly',
    enforcement: ['OVS_DROP', 'IPTABLES_DROP']
  },
  {
    alert_id: 'ALR-0026',
    timestamp: '2026-09-29 10:30',
    alert_name: 'SSH Brute Force Attempt',
    severity: 'High',
    status: 'Closed',
    verdict: 'True Positive',
    assignee: 'K.Adel (L2)',
    attack_type: 'Brute Force',
    src_ip: '172.16.131.50',
    dest_host: 'WIN-VICTIM-01',
    dest_port: '22',
    risk_score: 79,
    confidence_score: 0.93,
    action_taken: 'Blocked',
    comment: 'Confirmed. Source blocked.',
    detection: 'Both',
    enforcement: ['OVS_DROP', 'IPTABLES_DROP']
  },
  {
    alert_id: 'ALR-0025',
    timestamp: '2026-09-29 10:12',
    alert_name: 'Distributed DoS Attack',
    severity: 'Critical',
    status: 'Closed',
    verdict: 'True Positive',
    assignee: 'S.Nour (L2)',
    attack_type: 'DDoS',
    src_ip: 'multiple (31 sources)',
    dest_host: 'WEB-DMZ-01',
    dest_port: '443',
    risk_score: 97,
    confidence_score: 0.95,
    action_taken: 'Quarantined',
    comment: 'Confirmed. Traffic dropped.',
    detection: 'Both',
    enforcement: ['OVS_DROP', 'IPTABLES_DROP', 'QUARANTINE_VLAN']
  }
];

export const MODEL_METRICS: ModelMetrics = {
  algorithm: 'Random Forest (200 trees)',
  version: 'rf-0.1-synthetic',
  dataset: 'synthetic_zeek_conn.csv',
  split: 'time-based 70/30 (11704 train / 5017 test)',
  confusion_matrix: {
    tn: 3395,
    fp: 6,
    fn: 30,
    tp: 1586
  },
  top_features: [
    { name: 'conn_count_10s', importance: 0.26, raw: 0.258 },
    { name: 'resp_bytes', importance: 0.17, raw: 0.169 },
    { name: 'resp_pkts', importance: 0.12, raw: 0.122 },
    { name: 'orig_pkts', importance: 0.10, raw: 0.104 },
    { name: 'same_port_count_10s', importance: 0.10, raw: 0.102 },
    { name: 'duration', importance: 0.08, raw: 0.075 },
    { name: 'failed_ratio_10s', importance: 0.06, raw: 0.058 },
    { name: 'orig_bytes', importance: 0.05, raw: 0.053 },
  ],
  recall_per_attack: [
    { name: 'DoS', correct: 709, total: 709, recall: 100.0 },
    { name: 'DDoS', correct: 360, total: 360, recall: 100.0 },
    { name: 'Mirai Telnet', correct: 153, total: 153, recall: 100.0 },
    { name: 'Dangerous Port Probe', correct: 11, total: 11, recall: 100.0 },
    { name: 'Port Scan', correct: 186, total: 187, recall: 99.5 },
    { name: 'Brute Force', correct: 103, total: 105, recall: 98.1 },
    { name: 'Slow Scan', correct: 64, total: 91, recall: 70.3 }
  ]
};

export const TRAFFIC_TREND_DATA = [
  { time: '10:00', allowed: 18, blocked: 2 },
  { time: '10:25', allowed: 22, blocked: 3 },
  { time: '10:50', allowed: 15, blocked: 1 },
  { time: '11:15', allowed: 30, blocked: 6 },
  { time: '11:40', allowed: 45, blocked: 14 },
  { time: '12:05', allowed: 28, blocked: 5 },
  { time: '12:30', allowed: 20, blocked: 3 },
  { time: '12:55', allowed: 38, blocked: 9 },
  { time: '13:20', allowed: 25, blocked: 4 },
  { time: '13:45', allowed: 19, blocked: 2 },
];

/**
 * Generate synthetic connections behind an alert per specification:
 * - Count by attack type: Slow Scan 10, Port Scan 20, Brute Force 15, DoS 25, DDoS 35
 * - Multiple sources: 172.16.131.(100+i*13)
 * - Multiple ports: 1+i*137
 * - Brute force rows 900ms apart with duration 0.4+i*0.13
 * - Others 30ms apart with duration 0.01*(i%4)
 * - Host IPs: WEB-DMZ-01=172.16.133.10, WIN-VICTIM-01=172.16.132.10, WIN-VICTIM-02=172.16.132.11, DB-SRV-01=172.16.132.20
 */
export function generateConnectionsForAlert(alert: Alert): { totalCount: number; connections: ConnectionRecord[] } {
  const countMap: Record<AttackType, number> = {
    'Slow Scan': 10,
    'Port Scan': 20,
    'Brute Force': 15,
    'DoS': 25,
    'DDoS': 35,
    'Other': 10
  };

  const totalCount = countMap[alert.attack_type] || 15;
  const alertNo = alert.alert_id.replace('ALR-', '');
  const destIp = HOST_IP_MAP[alert.dest_host] || '172.16.132.10';

  // Base time parsed from alert timestamp
  const [datePart, timePart] = alert.timestamp.split(' ');
  const [hourStr, minStr] = (timePart || '12:00').split(':');
  const baseHour = parseInt(hourStr || '12', 10);
  const baseMin = parseInt(minStr || '00', 10);
  const baseSec = 14;

  const isBruteForce = alert.attack_type === 'Brute Force';
  const isMultipleSources = alert.src_ip.toLowerCase().includes('multiple');
  const isMultiplePorts = String(alert.dest_port).toLowerCase().includes('multiple');

  const connections: ConnectionRecord[] = [];

  for (let i = 0; i < totalCount; i++) {
    const id = `CON-${alertNo}${String(i + 1).padStart(2, '0')}`;
    
    // IP logic
    const src = isMultipleSources 
      ? `172.16.131.${100 + ((i * 13) % 150)}` 
      : alert.src_ip;

    // Port logic
    const port = isMultiplePorts 
      ? `${1 + (i * 137) % 65530}` 
      : alert.dest_port;

    // Timing logic
    let totalMsOffset: number;
    let durVal: string;

    if (isBruteForce) {
      totalMsOffset = i * 900;
      durVal = (0.4 + i * 0.13).toFixed(2);
    } else {
      totalMsOffset = i * 30;
      durVal = (0.01 * (i % 4)).toFixed(3);
    }

    const calculatedDate = new Date(Date.UTC(2026, 8, 29, baseHour, baseMin, baseSec, 120 + totalMsOffset));
    const hh = String(calculatedDate.getUTCHours()).padStart(2, '0');
    const mm = String(calculatedDate.getUTCMinutes()).padStart(2, '0');
    const ss = String(calculatedDate.getUTCSeconds()).padStart(2, '0');
    const ms = String(calculatedDate.getUTCMilliseconds()).padStart(3, '0');
    const timeFormatted = `${hh}:${mm}:${ss}.${ms}`;

    connections.push({
      id,
      time: timeFormatted,
      src_ip: src,
      dest_ip: destIp,
      port,
      duration: durVal
    });
  }

  return { totalCount, connections };
}

export const MITRE_MAPPINGS: Record<string, import('../types/security').MitreAttackInfo> = {
  'Slow Scan': {
    id: 'T1595.001',
    technique: 'Port Scanning',
    tactic: 'Reconnaissance',
    subtechnique: 'Active Scanning',
    url: 'https://attack.mitre.org/techniques/T1595/001/'
  },
  'Port Scan': {
    id: 'T1046',
    technique: 'Network Service Discovery',
    tactic: 'Discovery',
    url: 'https://attack.mitre.org/techniques/T1046/'
  },
  'Brute Force': {
    id: 'T1110',
    technique: 'Brute Force',
    tactic: 'Credential Access',
    subtechnique: 'T1110.001 Password Guessing',
    url: 'https://attack.mitre.org/techniques/T1110/'
  },
  'DoS': {
    id: 'T1498',
    technique: 'Network Denial of Service',
    tactic: 'Impact',
    subtechnique: 'T1498.001 Direct Network Flood',
    url: 'https://attack.mitre.org/techniques/T1498/'
  },
  'DDoS': {
    id: 'T1498.002',
    technique: 'Reflection Amplification',
    tactic: 'Impact',
    subtechnique: 'Distributed Denial of Service',
    url: 'https://attack.mitre.org/techniques/T1498/002/'
  },
  'Other': {
    id: 'T1205',
    technique: 'Traffic Signaling',
    tactic: 'Defense Evasion',
    url: 'https://attack.mitre.org/techniques/T1205/'
  }
};

export const TRAFFIC_TREND_BY_RANGE: Record<'1h' | '6h' | '24h', { time: string; allowed: number; blocked: number }[]> = {
  '1h': [
    { time: '13:00', allowed: 26, blocked: 3 },
    { time: '13:05', allowed: 31, blocked: 7 },
    { time: '13:10', allowed: 28, blocked: 4 },
    { time: '13:15', allowed: 34, blocked: 8 },
    { time: '13:20', allowed: 25, blocked: 4 },
    { time: '13:25', allowed: 29, blocked: 5 },
    { time: '13:30', allowed: 37, blocked: 9 },
    { time: '13:35', allowed: 32, blocked: 6 },
    { time: '13:40', allowed: 22, blocked: 3 },
    { time: '13:45', allowed: 19, blocked: 2 },
    { time: '13:50', allowed: 24, blocked: 4 },
    { time: '13:55', allowed: 27, blocked: 3 },
  ],
  '6h': [
    { time: '08:00', allowed: 12, blocked: 1 },
    { time: '08:30', allowed: 15, blocked: 2 },
    { time: '09:00', allowed: 19, blocked: 2 },
    { time: '09:30', allowed: 21, blocked: 3 },
    { time: '10:00', allowed: 18, blocked: 2 },
    { time: '10:30', allowed: 22, blocked: 3 },
    { time: '11:00', allowed: 15, blocked: 1 },
    { time: '11:30', allowed: 45, blocked: 14 },
    { time: '12:00', allowed: 28, blocked: 5 },
    { time: '12:30', allowed: 20, blocked: 3 },
    { time: '13:00', allowed: 38, blocked: 9 },
    { time: '13:30', allowed: 25, blocked: 4 },
  ],
  '24h': [
    { time: '00:00', allowed: 8, blocked: 0 },
    { time: '02:00', allowed: 6, blocked: 1 },
    { time: '04:00', allowed: 5, blocked: 0 },
    { time: '06:00', allowed: 11, blocked: 1 },
    { time: '08:00', allowed: 22, blocked: 3 },
    { time: '10:00', allowed: 35, blocked: 6 },
    { time: '11:00', allowed: 48, blocked: 15 },
    { time: '12:00', allowed: 32, blocked: 5 },
    { time: '13:00', allowed: 41, blocked: 9 },
    { time: '14:00', allowed: 29, blocked: 4 },
    { time: '16:00', allowed: 24, blocked: 3 },
    { time: '18:00', allowed: 19, blocked: 2 },
    { time: '20:00', allowed: 14, blocked: 1 },
    { time: '22:00', allowed: 9, blocked: 1 },
  ]
};

export const HEATMAP_HOURS = ['06:00', '08:00', '10:00', '11:00', '12:00', '13:00', '14:00', '16:00', '18:00', '20:00'];

