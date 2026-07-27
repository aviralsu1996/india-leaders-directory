/**
 * Enterprise Export API Engine
 * High Performance Export Handler for CSV, Excel, PDF, JSON, and Print
 */

export interface ExportColumnOption {
  key: string;
  label: string;
  format?: (value: any, item?: any) => string;
}

export interface ExportEngineOptions {
  data: any[];
  filename: string;
  title?: string;
  columns?: ExportColumnOption[];
  onProgress?: (progress: number, stage: string) => void;
  isCancelled?: () => boolean;
}

/**
 * Utility: Triggers safe browser download for any Blob object
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Helper to resolve object value by dot notation or column key
 */
function getFieldValue(item: any, column: ExportColumnOption): string {
  if (column.format) {
    return column.format(item[column.key], item);
  }
  let val = item[column.key];
  if (val === undefined || val === null) return '';
  if (Array.isArray(val)) return val.join('; ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

/**
 * Escape CSV string field
 */
function escapeCSVCell(value: string): string {
  if (!value) return '""';
  const str = String(value).replace(/"/g, '""');
  if (str.includes(',') || str.includes('\n') || str.includes('"') || str.includes(';')) {
    return `"${str}"`;
  }
  return `"${str}"`;
}

/**
 * 1. exportCSV
 */
export async function exportCSV({
  data,
  filename,
  columns,
  onProgress,
  isCancelled
}: ExportEngineOptions): Promise<boolean> {
  if (!data || data.length === 0) return false;

  const cols = columns || Object.keys(data[0]).map(k => ({ key: k, label: k }));
  const headers = cols.map(c => escapeCSVCell(c.label)).join(',');
  const rows: string[] = [headers];

  const batchSize = 500;
  const total = data.length;

  for (let i = 0; i < total; i++) {
    if (isCancelled && isCancelled()) return false;

    const item = data[i];
    const rowStr = cols.map(col => escapeCSVCell(getFieldValue(item, col))).join(',');
    rows.push(rowStr);

    if (i % batchSize === 0 && onProgress) {
      const pct = Math.round(((i + 1) / total) * 100);
      onProgress(pct, `Formatting CSV row ${i + 1} of ${total}...`);
      await new Promise(r => setTimeout(r, 0));
    }
  }

  // Prepend UTF-8 BOM so Excel opens non-ASCII characters correctly
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadBlob(blob, finalFilename);

  if (onProgress) onProgress(100, 'CSV Download Ready!');
  return true;
}

/**
 * 2. exportExcel (.xlsx compatible SpreadsheetML format)
 */
export async function exportExcel({
  data,
  filename,
  title = 'India Leaders Directory Data Export',
  columns,
  onProgress,
  isCancelled
}: ExportEngineOptions): Promise<boolean> {
  if (!data || data.length === 0) return false;

  const cols = columns || Object.keys(data[0]).map(k => ({ key: k, label: k }));
  const total = data.length;

  if (onProgress) onProgress(10, 'Building Excel Worksheet XML...');

  let xmlRows = '';
  // Header row
  xmlRows += '<Row ss:StyleID="HeaderStyle">';
  cols.forEach(col => {
    const safeLabel = (col.label || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    xmlRows += `<Cell><Data ss:Type="String">${safeLabel}</Data></Cell>`;
  });
  xmlRows += '</Row>\n';

  const batchSize = 300;
  for (let i = 0; i < total; i++) {
    if (isCancelled && isCancelled()) return false;

    const item = data[i];
    xmlRows += '<Row>';
    cols.forEach(col => {
      const rawVal = getFieldValue(item, col);
      const safeVal = String(rawVal)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
      xmlRows += `<Cell><Data ss:Type="String">${safeVal}</Data></Cell>`;
    });
    xmlRows += '</Row>\n';

    if (i % batchSize === 0 && onProgress) {
      const pct = 10 + Math.round(((i + 1) / total) * 80);
      onProgress(pct, `Generating Excel worksheet rows (${i + 1}/${total})...`);
      await new Promise(r => setTimeout(r, 0));
    }
  }

  const excelXml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#047857" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="DataExport">
  <Table>
   ${xmlRows}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([excelXml], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  downloadBlob(blob, finalFilename);

  if (onProgress) onProgress(100, 'Excel Download Ready!');
  return true;
}

/**
 * 3. exportJSON
 */
export async function exportJSON({
  data,
  filename,
  columns,
  onProgress
}: ExportEngineOptions): Promise<boolean> {
  if (!data || data.length === 0) return false;

  if (onProgress) onProgress(30, 'Structuring JSON Payload...');

  let outputData = data;
  if (columns && columns.length > 0) {
    outputData = data.map(item => {
      const obj: Record<string, any> = {};
      columns.forEach(col => {
        obj[col.key] = item[col.key];
      });
      return obj;
    });
  }

  if (onProgress) onProgress(80, 'Serializing JSON String...');
  await new Promise(r => setTimeout(r, 50));

  const jsonStr = JSON.stringify(outputData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const finalFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
  downloadBlob(blob, finalFilename);

  if (onProgress) onProgress(100, 'JSON Download Ready!');
  return true;
}

/**
 * 4. exportPDF / Print Friendly
 */
export async function exportPDF({
  data,
  filename,
  title = 'India Leaders Directory Export Report',
  columns,
  onProgress
}: ExportEngineOptions): Promise<boolean> {
  if (!data || data.length === 0) return false;

  if (onProgress) onProgress(20, 'Formatting PDF Printable Document...');

  const cols = columns || Object.keys(data[0]).map(k => ({ key: k, label: k }));
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const tableHeaders = cols.map(c => `<th style="padding: 8px; border: 1px solid #cbd5e1; background: #047857; color: #ffffff; text-align: left; font-size: 11px;">${c.label}</th>`).join('');
  
  const tableRows = data.map((item, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    const cells = cols.map(c => `<td style="padding: 6px 8px; border: 1px solid #e2e8f0; font-size: 10px; color: #1e293b;">${getFieldValue(item, c)}</td>`).join('');
    return `<tr style="background: ${bg};">${cells}</tr>`;
  }).join('');

  const htmlDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #0f172a; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #047857; padding-bottom: 12px; margin-bottom: 20px; }
    .title { font-size: 20px; font-weight: 800; color: #047857; text-transform: uppercase; }
    .subtitle { font-size: 11px; color: #64748b; margin-top: 4px; }
    .meta { font-size: 10px; color: #475569; text-align: right; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; pt-8px; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; }
    @media print {
      body { padding: 0; }
      @page { size: A4 landscape; margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">${title}</div>
      <div class="subtitle">Official Verified Dossier Export | India Leaders Directory</div>
    </div>
    <div class="meta">
      <div>Generated: ${timestamp}</div>
      <div>Records Count: <strong>${data.length}</strong></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>${tableHeaders}</tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div class="footer">
    <div>© RIVA Analytica Political Intelligence Portal</div>
    <div>Confidential Official Export • Page 1</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

  if (onProgress) onProgress(80, 'Opening Printable PDF Viewer...');

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlDoc);
    printWindow.document.close();
  } else {
    // Fallback if popup blocked: download as HTML file
    const blob = new Blob([htmlDoc], { type: 'text/html' });
    downloadBlob(blob, `${filename}.html`);
  }

  if (onProgress) onProgress(100, 'PDF Print Document Ready!');
  return true;
}
