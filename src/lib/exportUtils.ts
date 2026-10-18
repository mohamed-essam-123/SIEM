import ExcelJS from 'exceljs';
import { Alert } from '../types/security';

/**
 * Generate formatted timestamp string for filenames: YYYY-MM-DD_HH-mm
 */
export function getExportTimestamp(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}_${hh}-${min}`;
}

/**
 * Export filtered alerts as a styled multi-sheet Excel (.xlsx) file
 */
export async function exportAlertsToExcel(alerts: Alert[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SDN NDR & SIEM Dashboard';
  workbook.lastModifiedBy = 'SDN SecOps Analyst';
  workbook.created = new Date();
  workbook.modified = new Date();

  // -------------------------------------------------------------
  // Sheet 1: Alerts
  // -------------------------------------------------------------
  const sheet1 = workbook.addWorksheet('Alerts', {
    views: [{ state: 'frozen', ySplit: 1, activeCell: 'A2' }],
    pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  const columns = [
    { header: 'Alert ID', key: 'alert_id', width: 14 },
    { header: 'Time (UTC)', key: 'timestamp', width: 18 },
    { header: 'Alert Name', key: 'alert_name', width: 34 },
    { header: 'Severity', key: 'severity', width: 14 },
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Verdict', key: 'verdict', width: 16 },
    { header: 'Attack Type', key: 'attack_type', width: 16 },
    { header: 'Source IP', key: 'src_ip', width: 24 },
    { header: 'Target Host', key: 'dest_host', width: 18 },
    { header: 'Port', key: 'dest_port', width: 12 },
    { header: 'Risk Score', key: 'risk_score', width: 14 },
    { header: 'Confidence', key: 'confidence_score', width: 14 },
    { header: 'Detection', key: 'detection', width: 14 },
    { header: 'Action Taken', key: 'action_taken', width: 16 },
    { header: 'Assignee', key: 'assignee', width: 18 },
    { header: 'Comment', key: 'comment', width: 42 }
  ];

  sheet1.columns = columns;

  // Header row formatting
  const headerRow = sheet1.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0B1220' } // deep navy (#0b1220)
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF1F2B42' } },
      bottom: { style: 'medium', color: { argb: 'FF1F2B42' } },
      left: { style: 'thin', color: { argb: 'FF1F2B42' } },
      right: { style: 'thin', color: { argb: 'FF1F2B42' } }
    };
  });

  // Enable autofilter across all columns A1:P1
  sheet1.autoFilter = 'A1:P1';

  // Populate data rows
  alerts.forEach((alert, index) => {
    const rowNumber = index + 2;
    const isZebra = rowNumber % 2 === 1;
    const zebraBg = isZebra ? 'FFF8FAFC' : 'FFFFFFFF'; // slate-50 / white

    // Date parsing for real Excel date-time cell
    let dateObj: Date | string = alert.timestamp;
    try {
      const [dPart, tPart] = alert.timestamp.split(' ');
      if (dPart) {
        const [year, month, day] = dPart.split('-').map(Number);
        const [hour, min] = (tPart || '00:00').split(':').map(Number);
        dateObj = new Date(Date.UTC(year, month - 1, day, hour, min));
      }
    } catch {
      dateObj = alert.timestamp;
    }

    // Number conversions
    const riskNum = alert.risk_score === '-' || alert.risk_score === '' ? null : Number(alert.risk_score);
    const confNum = alert.confidence_score === '-' || alert.confidence_score === '' ? null : Number(alert.confidence_score);

    const row = sheet1.addRow({
      alert_id: alert.alert_id,
      timestamp: dateObj,
      alert_name: alert.alert_name,
      severity: alert.severity,
      status: alert.status,
      verdict: alert.verdict,
      attack_type: alert.attack_type,
      src_ip: alert.src_ip,
      dest_host: alert.dest_host,
      dest_port: alert.dest_port,
      risk_score: isNaN(riskNum as number) ? null : riskNum,
      confidence_score: isNaN(confNum as number) ? null : confNum,
      detection: alert.detection,
      action_taken: alert.action_taken,
      assignee: alert.assignee || 'None',
      comment: alert.comment || ''
    });

    row.height = 22;

    // Apply borders and zebra striping to each cell
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      // Default font & background
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: zebraBg }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };

      // Center specific code columns
      if ([1, 4, 5, 6, 7, 10, 11, 12, 13, 14].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      // Timestamp format
      if (colNumber === 2 && dateObj instanceof Date) {
        cell.numFmt = 'yyyy-mm-dd hh:mm';
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      // Risk score format
      if (colNumber === 11 && cell.value !== null) {
        cell.numFmt = '0';
      }

      // Confidence score format
      if (colNumber === 12 && cell.value !== null) {
        cell.numFmt = '0.00';
      }

      // Wrap text on comment
      if (colNumber === 16) {
        cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
      }
    });

    // Color-code Severity cell (Col 4)
    const severityCell = row.getCell(4);
    switch (alert.severity) {
      case 'Critical':
        severityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
        severityCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFDC2626' } };
        break;
      case 'High':
        severityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
        severityCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFD97706' } };
        break;
      case 'Medium':
        severityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
        severityCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF2563EB' } };
        break;
      case 'Low':
        severityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
        severityCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF059669' } };
        break;
    }

    // Color-code Verdict cell (Col 6)
    const verdictCell = row.getCell(6);
    switch (alert.verdict) {
      case 'True Positive':
        verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
        verdictCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF059669' } };
        break;
      case 'False Positive':
        verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
        verdictCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFDC2626' } };
        break;
      case 'None':
      default:
        verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        verdictCell.font = { name: 'Calibri', size: 10, color: { argb: 'FF64748B' } };
        break;
    }
  });

  // -------------------------------------------------------------
  // Sheet 2: Summary
  // -------------------------------------------------------------
  const sheet2 = workbook.addWorksheet('Summary');
  sheet2.columns = [
    { width: 4 },  // Margin column A
    { width: 28 }, // Metric / Category B
    { width: 16 }, // Value C
    { width: 22 }, // Subtitle / Pct D
    { width: 6 },  // Gap E
    { width: 28 }, // Category F
    { width: 16 }, // Value G
    { width: 16 }, // Pct H
  ];

  // Title Banner
  sheet2.mergeCells('B2:D2');
  const titleCell = sheet2.getCell('B2');
  titleCell.value = 'SDN NDR & SIEM Security Operations Summary';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0B1220' } };

  sheet2.getCell('B3').value = `Generated: ${new Date().toUTCString()} | Total Alerts Sampled: ${alerts.length}`;
  sheet2.getCell('B3').font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF64748B' } };

  // Calculate Metrics from exported alerts
  const totalAlerts = alerts.length;
  const awaitingAction = alerts.filter(a => a.status === 'Awaiting action').length;
  const escalatedL2 = alerts.filter(a => a.status === 'Escalated to L2').length;
  const criticalCount = alerts.filter(a => a.severity === 'Critical').length;
  const blockedCount = alerts.filter(a => a.enforcement && a.enforcement.length > 0).length;
  const blockedPct = totalAlerts > 0 ? (blockedCount / totalAlerts) * 100 : 0;
  const closedCount = alerts.filter(a => a.status === 'Closed').length;
  const fpCount = alerts.filter(a => a.status === 'Closed' && a.verdict === 'False Positive').length;
  const fpRate = closedCount > 0 ? (fpCount / closedCount) * 100 : 0;

  // KPI Section Header
  sheet2.mergeCells('B5:D5');
  const kpiHeader = sheet2.getCell('B5');
  kpiHeader.value = 'Operational KPIs';
  kpiHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  kpiHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1220' } };
  kpiHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  const kpis = [
    { label: 'Total alerts', value: totalAlerts, detail: 'Queue volume' },
    { label: 'Awaiting action', value: awaitingAction, detail: 'Pending triage' },
    { label: 'Escalated to L2', value: escalatedL2, detail: 'Tier-2 investigation' },
    { label: 'Critical alerts', value: criticalCount, detail: 'High priority threats' },
    { label: 'Blocked / quarantined %', value: `${blockedPct.toFixed(1)}%`, detail: `${blockedCount} of ${totalAlerts} mitigated` },
    { label: 'False positive rate', value: `${fpRate.toFixed(1)}%`, detail: `${fpCount} of ${closedCount} closed` },
  ];

  kpis.forEach((kpi, idx) => {
    const rowIdx = 6 + idx;
    sheet2.getCell(`B${rowIdx}`).value = kpi.label;
    sheet2.getCell(`B${rowIdx}`).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF334155' } };
    
    sheet2.getCell(`C${rowIdx}`).value = kpi.value;
    sheet2.getCell(`C${rowIdx}`).font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
    sheet2.getCell(`C${rowIdx}`).alignment = { horizontal: 'center' };

    sheet2.getCell(`D${rowIdx}`).value = kpi.detail;
    sheet2.getCell(`D${rowIdx}`).font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF64748B' } };

    ['B', 'C', 'D'].forEach(col => {
      sheet2.getCell(`${col}${rowIdx}`).border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      sheet2.getCell(`${col}${rowIdx}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: idx % 2 === 1 ? 'FFF8FAFC' : 'FFFFFFFF' }
      };
    });
  });

  // Table 1: Alerts by Severity (Right side, Row 5)
  sheet2.mergeCells('F5:H5');
  const sevHeader = sheet2.getCell('F5');
  sevHeader.value = 'Alerts by Severity';
  sevHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  sevHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1220' } };
  sevHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  const severityOrder = ['Critical', 'High', 'Medium', 'Low'];
  severityOrder.forEach((sev, idx) => {
    const count = alerts.filter(a => a.severity === sev).length;
    const pct = totalAlerts > 0 ? (count / totalAlerts) * 100 : 0;
    const rowIdx = 6 + idx;

    sheet2.getCell(`F${rowIdx}`).value = sev;
    sheet2.getCell(`F${rowIdx}`).font = { name: 'Calibri', size: 10, bold: true };
    sheet2.getCell(`G${rowIdx}`).value = count;
    sheet2.getCell(`G${rowIdx}`).alignment = { horizontal: 'center' };
    sheet2.getCell(`H${rowIdx}`).value = `${pct.toFixed(1)}%`;
    sheet2.getCell(`H${rowIdx}`).alignment = { horizontal: 'center' };

    ['F', 'G', 'H'].forEach(col => {
      sheet2.getCell(`${col}${rowIdx}`).border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  // Table 2: Alerts by Attack Type
  sheet2.mergeCells('B14:D14');
  const atkHeader = sheet2.getCell('B14');
  atkHeader.value = 'Alerts by Attack Type';
  atkHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  atkHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1220' } };
  atkHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  const attackTypes = ['Slow Scan', 'Port Scan', 'Brute Force', 'DoS', 'DDoS', 'Other'];
  attackTypes.forEach((atk, idx) => {
    const count = alerts.filter(a => a.attack_type === atk).length;
    const pct = totalAlerts > 0 ? (count / totalAlerts) * 100 : 0;
    const rowIdx = 15 + idx;

    sheet2.getCell(`B${rowIdx}`).value = atk;
    sheet2.getCell(`B${rowIdx}`).font = { name: 'Calibri', size: 10, bold: true };
    sheet2.getCell(`C${rowIdx}`).value = count;
    sheet2.getCell(`C${rowIdx}`).alignment = { horizontal: 'center' };
    sheet2.getCell(`D${rowIdx}`).value = `${pct.toFixed(1)}%`;
    sheet2.getCell(`D${rowIdx}`).alignment = { horizontal: 'center' };

    ['B', 'C', 'D'].forEach(col => {
      sheet2.getCell(`${col}${rowIdx}`).border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  // Table 3: Alerts by Detection Mode
  sheet2.mergeCells('F12:H12');
  const detHeader = sheet2.getCell('F12');
  detHeader.value = 'Alerts by Detection Mode';
  detHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  detHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1220' } };
  detHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  const detectionModes = ['Signature', 'Anomaly', 'Both', 'ML'];
  detectionModes.forEach((det, idx) => {
    const count = alerts.filter(a => a.detection === det).length;
    const pct = totalAlerts > 0 ? (count / totalAlerts) * 100 : 0;
    const rowIdx = 13 + idx;

    sheet2.getCell(`F${rowIdx}`).value = det;
    sheet2.getCell(`F${rowIdx}`).font = { name: 'Calibri', size: 10, bold: true };
    sheet2.getCell(`G${rowIdx}`).value = count;
    sheet2.getCell(`G${rowIdx}`).alignment = { horizontal: 'center' };
    sheet2.getCell(`H${rowIdx}`).value = `${pct.toFixed(1)}%`;
    sheet2.getCell(`H${rowIdx}`).alignment = { horizontal: 'center' };

    ['F', 'G', 'H'].forEach(col => {
      sheet2.getCell(`${col}${rowIdx}`).border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SIEM_Alerts_${getExportTimestamp()}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export filtered alerts as a UTF-8 BOM, CRLF, quoted ISO CSV file
 */
export function exportAlertsToCsv(alerts: Alert[]): void {
  const headers = [
    'alert_id',
    'timestamp',
    'alert_name',
    'severity',
    'status',
    'verdict',
    'attack_type',
    'src_ip',
    'dest_host',
    'dest_port',
    'risk_score',
    'confidence_score',
    'detection',
    'action_taken',
    'assignee',
    'comment'
  ];

  // Helper to quote and escape every single field
  const quote = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = alerts.map((a) => {
    // Format timestamp as ISO 8601 string: 2026-09-29T13:05:00.000Z
    let isoTimestamp = a.timestamp;
    try {
      const [dPart, tPart] = a.timestamp.split(' ');
      if (dPart) {
        const [year, month, day] = dPart.split('-').map(Number);
        const [hour, min] = (tPart || '00:00').split(':').map(Number);
        isoTimestamp = new Date(Date.UTC(year, month - 1, day, hour, min)).toISOString();
      }
    } catch {
      isoTimestamp = a.timestamp;
    }

    return [
      quote(a.alert_id),
      quote(isoTimestamp),
      quote(a.alert_name),
      quote(a.severity),
      quote(a.status),
      quote(a.verdict),
      quote(a.attack_type),
      quote(a.src_ip),
      quote(a.dest_host),
      quote(a.dest_port),
      quote(a.risk_score),
      quote(a.confidence_score),
      quote(a.detection),
      quote(a.action_taken),
      quote(a.assignee),
      quote(a.comment)
    ].join(',');
  });

  // Prepend UTF-8 BOM (\uFEFF) and use CRLF (\r\n) line endings
  const bom = '\uFEFF';
  const headerLine = headers.map(quote).join(',');
  const csvContent = bom + [headerLine, ...rows].join('\r\n') + '\r\n';

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SIEM_Alerts_${getExportTimestamp()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
