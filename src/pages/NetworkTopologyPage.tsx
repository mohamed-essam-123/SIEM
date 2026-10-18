import React, { useState } from 'react';
import { 
  Network, 
  Layers, 
  ArrowDown, 
  ShieldCheck, 
  ShieldAlert, 
  Server, 
  Radio, 
  Terminal, 
  Cpu, 
  Activity,
  HardDrive,
  Globe,
  Info,
  CheckCircle2,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export const NetworkTopologyPage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>('layer-1');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const architectureLayers = [
    {
      id: 'layer-1',
      layer: 'Layer 1',
      title: 'Network core',
      subtitle: 'Open vSwitch + FRRouting (OSPF)',
      role: 'Hardware/Virtual dataplane switching, OVS tap interfaces, and dynamic OSPF route redistribution across virtual zones.',
      icon: Network,
      color: 'border-blue-500/40 bg-blue-500/10 text-accent-blue',
      badge: 'Data Plane',
      metrics: { throughput: '1.4 Gbps', activeBridges: '4 Bridges', openflowRules: '1,248 Rules', latency: '0.4 ms' },
      tech: ['Open vSwitch 3.1', 'FRR OSPFv2', 'Kernel veth pairs']
    },
    {
      id: 'layer-2',
      layer: 'Layer 2',
      title: 'IDS & Risk Engine',
      subtitle: 'Zeek (port mirroring) → Risk Scoring',
      role: 'Continuous passive network analysis of mirrored traffic, conn/http/dns flow aggregation, and weighted risk engine computation.',
      icon: Activity,
      color: 'border-amber-500/40 bg-amber-500/10 text-accent-amber',
      badge: 'Detection Engine',
      metrics: { packetMirrorRate: '98,000 pkts/s', flowAnalysis: 'Real-time', featureExtraction: '8 features/conn', zeroPacketLoss: '99.98%' },
      tech: ['Zeek IDS 5.0', 'Flow Extractor', 'Risk Scorer']
    },
    {
      id: 'layer-3',
      layer: 'Layer 3',
      title: 'IPS',
      subtitle: 'ai_ips.py — block / quarantine if risk_score > threshold',
      role: 'Automated policy enforcement daemon executing reactive OVS OpenFlow drop rules, iptables filters, and VLAN isolation.',
      icon: ShieldAlert,
      color: 'border-red-500/40 bg-red-500/10 text-accent-red',
      badge: 'Enforcement Plane',
      metrics: { reactionLatency: '< 15 ms', autoDropEnacted: '12 Sources', quarantineVlanActive: '2 Ports', ovsFlowInject: 'Active' },
      tech: ['ai_ips.py daemon', 'OpenFlow Controller', 'iptables API']
    },
    {
      id: 'layer-4',
      layer: 'Layer 4',
      title: 'SIEM dashboard',
      subtitle: 'This web app — alerts, triage, reporting',
      role: 'Centralized SecOps incident command, real-time alert triage, L2 escalation, forensic packet inspections, and model retraining feedback.',
      icon: ShieldCheck,
      color: 'border-emerald-500/40 bg-emerald-500/10 text-accent-green',
      badge: 'Analyst Interface',
      metrics: { liveWebSocket: 'Active', queueResponse: '< 50 ms', analystFeedback: 'Active Loop', exportEngine: 'ExcelJS' },
      tech: ['React 18', 'TypeScript', 'Tailwind CSS', 'Recharts']
    }
  ];

  const networkZones = [
    {
      id: 'zone-attacker',
      bridge: 'br-attacker',
      subnet: '172.16.131.0/24',
      name: 'Adversary & Untrusted Segment',
      description: 'External simulation zone where simulated reconnaissance, brute force, and flood sources originate.',
      hosts: ['172.16.131.50 (SSH Attacker)', '172.16.131.61 (RDP Probe)', '172.16.131.72 (DoS Node)', '172.16.131.99 (Slow Scanner)'],
      status: 'Monitored & Restricted',
      statusColor: 'text-accent-red border-red-500/30 bg-red-500/10',
      flows: '3,410 flows/min'
    },
    {
      id: 'zone-victim',
      bridge: 'br-victim',
      subnet: '172.16.132.0/24',
      name: 'Internal Production Workstations & DB',
      description: 'High-value Windows victim clients and critical database servers protected under strict intrusion policies.',
      hosts: ['172.16.132.10 (WIN-VICTIM-01)', '172.16.132.11 (WIN-VICTIM-02)', '172.16.132.20 (DB-SRV-01)'],
      status: 'Active Defense',
      statusColor: 'text-accent-blue border-blue-500/30 bg-blue-500/10',
      flows: '1,890 flows/min'
    },
    {
      id: 'zone-dmz',
      bridge: 'br-dmz',
      subnet: '172.16.133.0/24',
      name: 'Demilitarized Zone (Public Edge)',
      description: 'Public-facing reverse proxies and web application servers subjected to incoming L4/L7 traffic.',
      hosts: ['172.16.133.10 (WEB-DMZ-01) Port 80/443'],
      status: 'Edge Protected',
      statusColor: 'text-accent-amber border-amber-500/30 bg-amber-500/10',
      flows: '4,120 flows/min'
    },
    {
      id: 'zone-monitor',
      bridge: 'br-monitor',
      subnet: '172.16.134.0/24',
      name: 'Security Observability & Management',
      description: 'Dedicated management network hosting Zeek port-mirror taps, vulnerability scanners, and telemetry exporters.',
      hosts: ['172.16.134.5 (Vuln Scanner / Sensor)', '172.16.134.1 (SDN Controller)'],
      status: 'Operational Normal',
      statusColor: 'text-accent-green border-emerald-500/30 bg-emerald-500/10',
      flows: '780 flows/min'
    }
  ];

  // Active details inspector
  const activeLayer = architectureLayers.find(l => l.id === selectedNode);
  const activeZone = networkZones.find(z => z.id === selectedNode);

  return (
    <div className="space-y-6">
      {/* Interactive Topology Diagram Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1f2b42] mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2">
              <Network className="w-5 h-5 text-accent-blue" />
              Interactive SDN NDR Topology & Four-Layer Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94a3bb] mt-0.5">
              Click any architecture layer or OVS bridge node to inspect telemetry metrics, flows, and inspection primitives
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-accent-blue animate-ping" />
              Animated live traffic paths
            </span>
          </div>
        </div>

        {/* Visual Interactive Diagram Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Diagram Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* OVS Bridges Row (Nodes connected to Layer 1) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  OVS Bridge Network Zones (Layer 2 Switching Domains)
                </span>
                <span className="text-[10px] font-mono text-accent-blue">Connected to Data Plane Core</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {networkZones.map((zone) => {
                  const isSelected = selectedNode === zone.id;
                  const isHovered = hoveredNode === zone.id;

                  return (
                    <div
                      key={zone.id}
                      onClick={() => setSelectedNode(zone.id)}
                      onMouseEnter={() => setHoveredNode(zone.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all relative ${
                        isSelected
                          ? 'bg-accent-blue/15 border-accent-blue shadow-glow-blue'
                          : 'bg-slate-50 dark:bg-[#0b1220] border-slate-200 dark:border-[#1f2b42] hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-mono text-xs font-bold text-accent-blue truncate">
                          {zone.bridge}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-accent-green shrink-0" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">
                        {zone.subnet}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 block truncate mt-1">
                        {zone.flows}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Animated Flow Connecting Lines from Zones to Layer 1 */}
              <div className="flex items-center justify-around py-1 text-accent-blue">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-0.5 h-3 bg-accent-blue/40" />
                    <ArrowDown className="w-3.5 h-3.5 animate-bounce text-accent-blue" />
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical Four-Layer Pipeline */}
            <div className="space-y-4">
              {architectureLayers.map((layer, index) => {
                const Icon = layer.icon;
                const isSelected = selectedNode === layer.id;
                const isHovered = hoveredNode === layer.id;
                const isLast = index === architectureLayers.length - 1;

                return (
                  <React.Fragment key={layer.id}>
                    <div
                      onClick={() => setSelectedNode(layer.id)}
                      onMouseEnter={() => setHoveredNode(layer.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-accent-blue/10 border-accent-blue shadow-glow-blue'
                          : 'bg-slate-50 dark:bg-[#0b1220] border-slate-200 dark:border-[#1f2b42] hover:border-slate-400 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className={`p-2.5 rounded-xl border shrink-0 ${layer.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-accent-blue uppercase">
                                {layer.layer}
                              </span>
                              <span className="text-xs text-slate-400">·</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-[#e6ebf5]">
                                {layer.title}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-[#162238] text-slate-700 dark:text-[#94a3bb]">
                                {layer.badge}
                              </span>
                            </div>
                            <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 block mt-0.5">
                              {layer.subtitle}
                            </span>
                            <p className="text-xs text-slate-500 dark:text-[#94a3bb] mt-1 line-clamp-2">
                              {layer.role}
                            </p>
                          </div>
                        </div>

                        <div className="hidden sm:flex flex-col items-end shrink-0 gap-1">
                          <span className="text-[11px] font-mono text-emerald-500 font-bold flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Live
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Click to inspect
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Animated Flow Arrow */}
                    {!isLast && (
                      <div className="flex items-center justify-center -my-2 relative z-10">
                        <div className="p-1 rounded-full bg-white dark:bg-[#111a2b] border border-slate-300 dark:border-[#1f2b42] text-accent-blue shadow-xs">
                          <ArrowDown className="w-4 h-4 animate-bounce" />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Right Inspector Panel */}
          <div className="lg:col-span-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42] h-full flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1f2b42]">
                  <span className="text-xs font-bold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-accent-blue" />
                    Topology Node Inspector
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-accent-blue/15 text-accent-blue border border-accent-blue/30 font-bold">
                    {activeLayer ? activeLayer.layer : 'Zone Node'}
                  </span>
                </div>

                {activeLayer && (
                  <div className="pt-3 space-y-4 text-xs">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {activeLayer.title}
                      </h4>
                      <span className="font-mono text-xs text-accent-blue block">
                        {activeLayer.subtitle}
                      </span>
                      <p className="text-slate-600 dark:text-[#94a3bb] mt-2 leading-relaxed">
                        {activeLayer.role}
                      </p>
                    </div>

                    {/* Telemetry Metrics */}
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#1f2b42]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Live Runtime Telemetry
                      </span>
                      {Object.entries(activeLayer.metrics).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#111a2b] border border-slate-200 dark:border-[#1f2b42]/60">
                          <span className="capitalize text-slate-500 dark:text-[#94a3bb]">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Component Stack */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-[#1f2b42]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Engine Primitives
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {activeLayer.tech.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-[#111a2b] border border-slate-200 dark:border-[#1f2b42] text-slate-700 dark:text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeZone && (
                  <div className="pt-3 space-y-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-accent-blue">
                          {activeZone.bridge}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent-blue/15 text-accent-blue">
                          {activeZone.subnet}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        {activeZone.name}
                      </h4>
                      <p className="text-slate-600 dark:text-[#94a3bb] mt-2 leading-relaxed">
                        {activeZone.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#1f2b42]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Attached Hosts & Endpoints
                      </span>
                      {activeZone.hosts.map((host) => (
                        <div key={host} className="p-2 rounded-lg bg-white dark:bg-[#111a2b] border border-slate-200 dark:border-[#1f2b42]/60 font-mono text-[11px] text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-blue shrink-0" />
                          <span>{host}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-accent-blue/10 border border-accent-blue/20 text-[11px] text-accent-blue flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Zero-Trust OpenFlow dynamic policy synchronization active</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Network Zones Cards */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2">
            <Server className="w-5 h-5 text-accent-blue" />
            Network zones (OVS bridges)
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94a3bb] mt-0.5">
            Isolated layer-2 broadcast domains and Open vSwitch bridge routing topologies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {networkZones.map((zone) => (
            <div
              key={zone.bridge}
              className="p-5 rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42] hover:border-slate-300 dark:hover:border-slate-700 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-accent-blue">
                      {zone.bridge}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-accent-blue/10 text-accent-blue border border-accent-blue/30">
                      {zone.subnet}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-[#e6ebf5]">
                    {zone.name}
                  </h4>
                </div>

                <span className={`px-2 py-1 rounded-full text-[10px] font-mono font-semibold border ${zone.statusColor} whitespace-nowrap`}>
                  {zone.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-[#94a3bb] leading-relaxed">
                {zone.description}
              </p>

              <div className="pt-2 border-t border-slate-200 dark:border-[#1f2b42]/60">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-[#94a3bb] block mb-1">
                  Attached Endpoints & Virtual Hosts:
                </span>
                <div className="space-y-1">
                  {zone.hosts.map((host) => (
                    <div key={host} className="flex items-center gap-2 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-blue shrink-0" />
                      <span>{host}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
