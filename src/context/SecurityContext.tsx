import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Alert, 
  Severity, 
  Status, 
  Verdict, 
  AttackType, 
  DetectionMode, 
  EnforcementAction, 
  ThresholdSettings,
  NotificationItem
} from '../types/security';
import { INITIAL_ALERTS } from '../data/data';

export interface SecurityContextType {
  alerts: Alert[];
  thresholds: ThresholdSettings;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  escalateAlert: (id: string) => void;
  closeAlert: (id: string, verdict: 'True Positive' | 'False Positive') => void;
  bulkEscalate: (ids: string[]) => void;
  bulkClose: (ids: string[], verdict: 'True Positive' | 'False Positive') => void;
  updateComment: (id: string, comment: string) => void;
  createAlert: (alertData: {
    alert_name: string;
    severity: Severity;
    status: Status;
    attack_type: AttackType;
    assignee: string;
    src_ip: string;
    dest_host: string;
    comment: string;
  }) => void;
  updateThresholds: (thresholds: Partial<ThresholdSettings>) => void;
  exportCsv: () => void;
  
  // Live Feed Simulation
  isLiveFeedPaused: boolean;
  toggleLiveFeed: () => void;
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  liveToast: { id: string; title: string; alertId: string; severity: Severity } | null;
  dismissLiveToast: () => void;

  // Computed KPIs
  totalAlerts: number;
  awaitingActionCount: number;
  escalatedL2Count: number;
  criticalCount: number;
  blockedOrQuarantinedCount: number;
  blockedPercentage: number;
  closedCount: number;
  falsePositiveCount: number;
  truePositiveCount: number;
  mlDetectedCount: number;
  falsePositiveRate: number;
  topAttackerIps: { ip: string; count: number }[];
  attackTypeDistribution: { name: AttackType; value: number; color: string }[];
  detectionModeDistribution: { name: DetectionMode; value: number; color: string }[];
  enforcementCounts: { ovsDrop: number; iptablesDrop: number; quarantineVlan: number };
  recentEnforcementAlerts: Alert[];
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const ATTACK_TYPE_COLORS: Record<AttackType, string> = {
  'Slow Scan': '#4cc27a',     // green
  'Port Scan': '#5b8cff',     // blue
  'Brute Force': '#f5a524',   // amber
  'DoS': '#ff6b6b',           // red
  'DDoS': '#a98bff',          // purple
  'Other': '#94a3bb'          // gray
};

const DETECTION_MODE_COLORS: Record<DetectionMode, string> = {
  'Signature': '#5b8cff',     // blue
  'Anomaly': '#f5a524',       // amber
  'Both': '#a98bff',          // purple
  'ML': '#4cc27a'             // green
};

const SIMULATED_ATTACK_TEMPLATES: {
  attack_type: AttackType;
  names: string[];
  ports: string[];
  detection: DetectionMode;
}[] = [
  {
    attack_type: 'Brute Force',
    names: ['SSH Brute Force Attempt', 'Kerberos Ticket Guessing', 'RDP Credential Spraying'],
    ports: ['22', '3389', '88'],
    detection: 'Anomaly'
  },
  {
    attack_type: 'Slow Scan',
    names: ['Stealth Scan below rate threshold', 'Low-and-Slow Endpoint Probe', 'Stealthy SYN Reconnaissance'],
    ports: ['multiple'],
    detection: 'ML'
  },
  {
    attack_type: 'Port Scan',
    names: ['Port Scan Sweep', 'TCP SYN Port Scan Detected', 'Aggressive Port Sweep'],
    ports: ['multiple'],
    detection: 'Signature'
  },
  {
    attack_type: 'DoS',
    names: ['DoS Flood Against Web Server', 'ICMP Traffic Overload', 'L4 SYN Flood Exhaustion'],
    ports: ['80', '443', '8080'],
    detection: 'Both'
  },
  {
    attack_type: 'DDoS',
    names: ['Distributed DoS Flood Burst', 'Multi-Source Volumetric Flood', 'Distributed Amplification Attack'],
    ports: ['443', '80'],
    detection: 'Both'
  }
];

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('siem_alerts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved alerts', e);
      }
    }
    return INITIAL_ALERTS;
  });

  const [thresholds, setThresholds] = useState<ThresholdSettings>(() => {
    const saved = localStorage.getItem('siem_thresholds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved thresholds', e);
      }
    }
    return {
      block_threshold: 40,
      quarantine_threshold: 80,
      ml_confidence_threshold: 0.80
    };
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('siem_theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return 'dark';
  });

  // Live feed simulation states
  const [isLiveFeedPaused, setIsLiveFeedPaused] = useState<boolean>(() => {
    return localStorage.getItem('siem_feed_paused') === 'true';
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => [
    {
      id: 'notif-1',
      alert_id: 'ALR-0034',
      title: 'Slow Port Scan (ML) detected',
      severity: 'Medium',
      timestamp: '13:05',
      read: false
    },
    {
      id: 'notif-2',
      alert_id: 'ALR-0032',
      title: 'Distributed DoS Attack targeting WEB-DMZ-01',
      severity: 'High',
      timestamp: '12:41',
      read: false
    },
    {
      id: 'notif-3',
      alert_id: 'ALR-0029',
      title: 'DoS Flood Against Server quarantined',
      severity: 'Critical',
      timestamp: '11:30',
      read: true
    }
  ]);

  const [liveToast, setLiveToast] = useState<{ id: string; title: string; alertId: string; severity: Severity } | null>(null);

  // Persist alerts
  useEffect(() => {
    localStorage.setItem('siem_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Persist thresholds
  useEffect(() => {
    localStorage.setItem('siem_thresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  // Persist pause state
  useEffect(() => {
    localStorage.setItem('siem_feed_paused', String(isLiveFeedPaused));
  }, [isLiveFeedPaused]);

  // Handle theme changes
  useEffect(() => {
    localStorage.setItem('siem_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleLiveFeed = () => {
    setIsLiveFeedPaused(prev => !prev);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismissLiveToast = () => {
    setLiveToast(null);
  };

  const escalateAlert = (id: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.alert_id === id) {
        return {
          ...a,
          status: 'Escalated to L2',
          assignee: 'S.Nour (L2)'
        };
      }
      return a;
    }));
  };

  const closeAlert = (id: string, verdict: 'True Positive' | 'False Positive') => {
    setAlerts(prev => prev.map(a => {
      if (a.alert_id === id) {
        return {
          ...a,
          status: 'Closed',
          verdict
        };
      }
      return a;
    }));
  };

  const bulkEscalate = (ids: string[]) => {
    setAlerts(prev => prev.map(a => {
      if (ids.includes(a.alert_id) && a.status !== 'Closed') {
        return {
          ...a,
          status: 'Escalated to L2',
          assignee: 'S.Nour (L2)'
        };
      }
      return a;
    }));
  };

  const bulkClose = (ids: string[], verdict: 'True Positive' | 'False Positive') => {
    setAlerts(prev => prev.map(a => {
      if (ids.includes(a.alert_id)) {
        return {
          ...a,
          status: 'Closed',
          verdict
        };
      }
      return a;
    }));
  };

  const updateComment = (id: string, comment: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.alert_id === id) {
        return { ...a, comment };
      }
      return a;
    }));
  };

  const createAlert = (alertData: {
    alert_name: string;
    severity: Severity;
    status: Status;
    attack_type: AttackType;
    assignee: string;
    src_ip: string;
    dest_host: string;
    comment: string;
  }) => {
    let maxId = 34;
    alerts.forEach(a => {
      const match = a.alert_id.match(/ALR-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxId) maxId = num;
      }
    });
    const nextId = `ALR-${String(maxId + 1).padStart(4, '0')}`;

    const now = new Date();
    const hh = String(now.getUTCHours()).padStart(2, '0');
    const mm = String(now.getUTCMinutes()).padStart(2, '0');
    const timestamp = `2026-09-29 ${hh}:${mm}`;

    const newAlert: Alert = {
      alert_id: nextId,
      timestamp,
      alert_name: alertData.alert_name,
      severity: alertData.severity,
      status: alertData.status,
      verdict: 'None',
      assignee: alertData.assignee || 'None',
      attack_type: alertData.attack_type,
      src_ip: alertData.src_ip || '172.16.131.50',
      dest_host: alertData.dest_host || 'WIN-VICTIM-01',
      dest_port: 'multiple',
      risk_score: '-',
      confidence_score: '-',
      action_taken: 'Monitored',
      comment: alertData.comment,
      detection: 'Signature',
      enforcement: []
    };

    setAlerts(prev => [newAlert, ...prev]);
  };

  // Live Feed Simulation Timer: every 20-25s generates a new realistic alert
  useEffect(() => {
    if (isLiveFeedPaused) return;

    const interval = setInterval(() => {
      // Pick random template
      const template = SIMULATED_ATTACK_TEMPLATES[Math.floor(Math.random() * SIMULATED_ATTACK_TEMPLATES.length)];
      const alertName = template.names[Math.floor(Math.random() * template.names.length)];
      const targetHosts = ['WEB-DMZ-01', 'WIN-VICTIM-01', 'WIN-VICTIM-02', 'DB-SRV-01'];
      const targetHost = targetHosts[Math.floor(Math.random() * targetHosts.length)];
      const destPort = template.ports[Math.floor(Math.random() * template.ports.length)];

      const isMultiSource = template.attack_type === 'DDoS';
      const srcIp = isMultiSource 
        ? `multiple (${Math.floor(Math.random() * 25 + 15)} sources)` 
        : `172.16.131.${Math.floor(Math.random() * 140 + 20)}`;

      // Calculate risk and severity
      const riskScore = Math.floor(Math.random() * 45 + 53); // 53 - 97
      const confScore = Number((0.84 + Math.random() * 0.14).toFixed(2));

      let severity: Severity = 'Medium';
      if (riskScore >= 88) severity = 'Critical';
      else if (riskScore >= 68) severity = 'High';

      let enforcement: EnforcementAction[] = [];
      let actionTaken = 'Monitored';
      if (riskScore >= 85) {
        enforcement = ['OVS_DROP', 'IPTABLES_DROP', 'QUARANTINE_VLAN'];
        actionTaken = 'Quarantined';
      } else if (riskScore >= 55) {
        enforcement = ['OVS_DROP', 'IPTABLES_DROP'];
        actionTaken = 'Blocked';
      }

      setAlerts(prev => {
        let maxId = 34;
        prev.forEach(a => {
          const match = a.alert_id.match(/ALR-(\d+)/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxId) maxId = num;
          }
        });
        const nextId = `ALR-${String(maxId + 1).padStart(4, '0')}`;

        const now = new Date();
        const hh = String(now.getUTCHours()).padStart(2, '0');
        const mm = String(now.getUTCMinutes()).padStart(2, '0');
        const timestamp = `2026-09-29 ${hh}:${mm}`;

        const generatedAlert: Alert = {
          alert_id: nextId,
          timestamp,
          alert_name: alertName,
          severity,
          status: 'Awaiting action',
          verdict: 'None',
          assignee: 'None',
          attack_type: template.attack_type,
          src_ip: srcIp,
          dest_host: targetHost,
          dest_port: destPort,
          risk_score: riskScore,
          confidence_score: confScore,
          action_taken: actionTaken,
          comment: '',
          detection: template.detection,
          enforcement
        };

        // Add notification
        setNotifications(curr => [
          {
            id: `notif-${Date.now()}`,
            alert_id: nextId,
            title: `${alertName} (${srcIp})`,
            severity,
            timestamp: `${hh}:${mm}`,
            read: false
          },
          ...curr.slice(0, 15)
        ]);

        // Trigger toast
        setLiveToast({
          id: `toast-${Date.now()}`,
          title: alertName,
          alertId: nextId,
          severity
        });

        return [generatedAlert, ...prev];
      });
    }, 22000); // Trigger every 22 seconds

    return () => clearInterval(interval);
  }, [isLiveFeedPaused]);

  // Auto-dismiss live toast after 4s
  useEffect(() => {
    if (!liveToast) return;
    const t = setTimeout(() => {
      setLiveToast(null);
    }, 4500);
    return () => clearTimeout(t);
  }, [liveToast]);

  const updateThresholds = (newThresholds: Partial<ThresholdSettings>) => {
    setThresholds(prev => ({ ...prev, ...newThresholds }));
  };

  const exportCsv = () => {
    // Basic fallback export handled in exportUtils now
  };

  // Computed KPIs
  const totalAlerts = alerts.length;
  const awaitingActionCount = alerts.filter(a => a.status === 'Awaiting action').length;
  const escalatedL2Count = alerts.filter(a => a.status === 'Escalated to L2').length;
  const criticalCount = alerts.filter(a => a.severity === 'Critical').length;
  
  const blockedOrQuarantinedCount = alerts.filter(a => a.enforcement && a.enforcement.length > 0).length;
  const blockedPercentage = totalAlerts > 0 ? Math.round((blockedOrQuarantinedCount / totalAlerts) * 100) : 0;

  const closedCount = alerts.filter(a => a.status === 'Closed').length;
  const falsePositiveCount = alerts.filter(a => a.status === 'Closed' && a.verdict === 'False Positive').length;
  const truePositiveCount = alerts.filter(a => a.status === 'Closed' && a.verdict === 'True Positive').length;
  const mlDetectedCount = alerts.filter(a => a.detection === 'ML').length;
  const falsePositiveRate = closedCount > 0 ? Math.round((falsePositiveCount / closedCount) * 100) : 0;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Top 5 Attacker source IPs (excluding "multiple")
  const topAttackerIps = useMemo(() => {
    const ipCounts: Record<string, number> = {};
    alerts.forEach(a => {
      if (!a.src_ip.toLowerCase().includes('multiple')) {
        ipCounts[a.src_ip] = (ipCounts[a.src_ip] || 0) + 1;
      }
    });

    return Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [alerts]);

  // Attack types distribution for donut chart
  const attackTypeDistribution = useMemo(() => {
    const counts: Record<AttackType, number> = {
      'Slow Scan': 0,
      'Port Scan': 0,
      'Brute Force': 0,
      'DoS': 0,
      'DDoS': 0,
      'Other': 0
    };
    alerts.forEach(a => {
      counts[a.attack_type] = (counts[a.attack_type] || 0) + 1;
    });

    const types: AttackType[] = ['Slow Scan', 'Port Scan', 'Brute Force', 'DoS', 'DDoS', 'Other'];
    return types
      .filter(t => counts[t] > 0)
      .map(name => ({
        name,
        value: counts[name],
        color: ATTACK_TYPE_COLORS[name]
      }));
  }, [alerts]);

  // Detection mode distribution
  const detectionModeDistribution = useMemo(() => {
    const counts: Record<DetectionMode, number> = {
      'Signature': 0,
      'Anomaly': 0,
      'Both': 0,
      'ML': 0
    };
    alerts.forEach(a => {
      if (counts[a.detection] !== undefined) {
        counts[a.detection] = counts[a.detection] + 1;
      }
    });

    const modes: DetectionMode[] = ['Signature', 'Anomaly', 'Both', 'ML'];
    return modes.map(name => ({
      name,
      value: counts[name],
      color: DETECTION_MODE_COLORS[name]
    }));
  }, [alerts]);

  // Enforcement breakdown counts
  const enforcementCounts = useMemo(() => {
    let ovsDrop = 0;
    let iptablesDrop = 0;
    let quarantineVlan = 0;

    alerts.forEach(a => {
      a.enforcement.forEach(e => {
        if (e === 'OVS_DROP') ovsDrop++;
        if (e === 'IPTABLES_DROP') iptablesDrop++;
        if (e === 'QUARANTINE_VLAN') quarantineVlan++;
      });
    });

    return { ovsDrop, iptablesDrop, quarantineVlan };
  }, [alerts]);

  // Recent enforcement actions (latest 6 alerts with enforcement)
  const recentEnforcementAlerts = useMemo(() => {
    return alerts
      .filter(a => a.enforcement && a.enforcement.length > 0)
      .slice(0, 6);
  }, [alerts]);

  return (
    <SecurityContext.Provider
      value={{
        alerts,
        thresholds,
        theme,
        toggleTheme,
        escalateAlert,
        closeAlert,
        bulkEscalate,
        bulkClose,
        updateComment,
        createAlert,
        updateThresholds,
        exportCsv,
        isLiveFeedPaused,
        toggleLiveFeed,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        liveToast,
        dismissLiveToast,
        totalAlerts,
        awaitingActionCount,
        escalatedL2Count,
        criticalCount,
        blockedOrQuarantinedCount,
        blockedPercentage,
        closedCount,
        falsePositiveCount,
        truePositiveCount,
        mlDetectedCount,
        falsePositiveRate,
        topAttackerIps,
        attackTypeDistribution,
        detectionModeDistribution,
        enforcementCounts,
        recentEnforcementAlerts
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
