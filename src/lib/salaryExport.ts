import { SalaryStructure } from '../types';

export function exportSalaryCSV(salary: SalaryStructure, leaderName?: string) {
  const name = leaderName || salary.designation;
  const rows = [
    ['Field', 'Value / Amount'],
    ['Leader / Representative', name],
    ['Designation', salary.designation],
    ['State / Jurisdiction', salary.state],
    ['Basic Monthly Salary', `₹${salary.basic_salary.toLocaleString('en-IN')}`],
    ['Annual Salary', `₹${salary.annual_salary.toLocaleString('en-IN')}`],
    ['Constituency Allowance', `₹${salary.constituency_allowance.toLocaleString('en-IN')}`],
    ['Office Allowance', `₹${salary.office_allowance.toLocaleString('en-IN')}`],
    ['Staff Allowance', `₹${salary.staff_allowance.toLocaleString('en-IN')}`],
    ['Travel Allowance', `₹${salary.travel_allowance.toLocaleString('en-IN')}`],
    ['Daily Allowance', `₹${salary.daily_allowance.toLocaleString('en-IN')}`],
    ['Total Monthly Package', `₹${(salary.basic_salary + salary.constituency_allowance + salary.office_allowance + salary.staff_allowance + salary.travel_allowance).toLocaleString('en-IN')}`],
    ['Housing Facility', salary.housing],
    ['Official Vehicle', salary.vehicle],
    ['Security Category', salary.security],
    ['Medical Benefits', salary.medical],
    ['Pension Eligibility', salary.pension],
    ['Official Residence', salary.housing],
    ['Communication Allowance', salary.telephone],
    ['Other Government Benefits', salary.other_benefits],
    ['Effective From', salary.effective_from],
    ['Last Updated', salary.last_updated],
    ['Official Source', salary.source],
    ['Notification Link', salary.official_notification]
  ];

  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Salary_Entitlements_${name.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportSalaryJSON(salary: SalaryStructure, leaderName?: string) {
  const name = leaderName || salary.designation;
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ leaderName: name, salaryEntitlements: salary }, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `Salary_Entitlements_${name.replace(/\s+/g, '_')}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportSalaryExcel(salary: SalaryStructure, leaderName?: string) {
  // Generates XML Spreadsheet format natively supported by MS Excel & LibreOffice
  const name = leaderName || salary.designation;
  const totalMonthly = salary.basic_salary + salary.constituency_allowance + salary.office_allowance + salary.staff_allowance + salary.travel_allowance;
  
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Salary Entitlements">
  <Table>
   <Column ss:Width="200"/>
   <Column ss:Width="400"/>
   <Row><Cell><Data ss:Type="String">OFFICIAL SALARY & ENTITLEMENTS DOSSIER</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Representative</Data></Cell><Cell><Data ss:Type="String">${name}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Designation</Data></Cell><Cell><Data ss:Type="String">${salary.designation}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">State / Jurisdiction</Data></Cell><Cell><Data ss:Type="String">${salary.state}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Basic Monthly Salary</Data></Cell><Cell><Data ss:Type="Number">${salary.basic_salary}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Annual Salary</Data></Cell><Cell><Data ss:Type="Number">${salary.annual_salary}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Constituency Allowance</Data></Cell><Cell><Data ss:Type="Number">${salary.constituency_allowance}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Office Allowance</Data></Cell><Cell><Data ss:Type="Number">${salary.office_allowance}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Staff Allowance</Data></Cell><Cell><Data ss:Type="Number">${salary.staff_allowance}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Travel Allowance</Data></Cell><Cell><Data ss:Type="Number">${salary.travel_allowance}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Daily Allowance</Data></Cell><Cell><Data ss:Type="Number">${salary.daily_allowance}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Total Estimated Monthly Package</Data></Cell><Cell><Data ss:Type="Number">${totalMonthly}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Housing Facility</Data></Cell><Cell><Data ss:Type="String">${salary.housing}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Official Vehicle</Data></Cell><Cell><Data ss:Type="String">${salary.vehicle}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Security Category</Data></Cell><Cell><Data ss:Type="String">${salary.security}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Medical Benefits</Data></Cell><Cell><Data ss:Type="String">${salary.medical}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Pension Eligibility</Data></Cell><Cell><Data ss:Type="String">${salary.pension}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Official Source</Data></Cell><Cell><Data ss:Type="String">${salary.source}</Data></Cell></Row>
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Salary_Entitlements_${name.replace(/\s+/g, '_')}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportSalaryPDF(salary: SalaryStructure, leaderName?: string) {
  const name = leaderName || salary.designation;
  const totalMonthly = salary.basic_salary + salary.constituency_allowance + salary.office_allowance + salary.staff_allowance + salary.travel_allowance;
  const allowancesTotal = salary.constituency_allowance + salary.office_allowance + salary.staff_allowance + salary.travel_allowance;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Official Salary & Entitlements Dossier - ${name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111827; margin: 30px; line-height: 1.5; }
    .header { border-bottom: 3px solid #059669; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-size: 22px; font-weight: 800; color: #065f46; margin: 0; }
    .subtitle { font-size: 13px; color: #4b5563; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
    .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; }
    .card-title { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #6b7280; letter-spacing: 0.5px; }
    .card-val { font-size: 20px; font-weight: 800; color: #047857; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 700; color: #374151; font-size: 11px; text-transform: uppercase; }
    .disclaimer { font-size: 11px; color: #6b7280; font-style: italic; margin-top: 24px; padding: 12px; background: #fffbe3; border: 1px solid #fef3c7; border-radius: 6px; }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">Official Salary & Entitlements Dossier</h1>
      <p class="subtitle">Leader: <strong>${name}</strong> | Designation: <strong>${salary.designation}</strong> (${salary.state})</p>
    </div>
    <div style="text-align: right; font-size: 11px; color: #6b7280;">
      Published Gazette Source<br><strong>${salary.source}</strong>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Basic Monthly Salary</div>
      <div class="card-val">₹${salary.basic_salary.toLocaleString('en-IN')}</div>
    </div>
    <div class="card">
      <div class="card-title">Annualized Package</div>
      <div class="card-val">₹${salary.annual_salary.toLocaleString('en-IN')}</div>
    </div>
    <div class="card">
      <div class="card-title">Total Allowances</div>
      <div class="card-val">₹${allowancesTotal.toLocaleString('en-IN')}</div>
    </div>
    <div class="card" style="background: #ecfdf5; border-color: #a7f3d0;">
      <div class="card-title" style="color: #047857;">Total Estimated Monthly Package</div>
      <div class="card-val" style="color: #065f46;">₹${totalMonthly.toLocaleString('en-IN')}</div>
    </div>
  </div>

  <h3 style="font-size: 15px; margin-bottom: 8px;">Detailed Official Entitlements Breakdown</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 35%;">Entitlement Category</th>
        <th>Official Government Provision</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><strong>Basic Monthly Salary</strong></td><td>₹${salary.basic_salary.toLocaleString('en-IN')}</td></tr>
      <tr><td><strong>Constituency Allowance</strong></td><td>₹${salary.constituency_allowance.toLocaleString('en-IN')} / month</td></tr>
      <tr><td><strong>Office Secretarial Allowance</strong></td><td>₹${salary.office_allowance.toLocaleString('en-IN')} / month</td></tr>
      <tr><td><strong>Staff Assistance Allowance</strong></td><td>₹${salary.staff_allowance.toLocaleString('en-IN')} / month</td></tr>
      <tr><td><strong>Travel & Conveyance Allowance</strong></td><td>₹${salary.travel_allowance.toLocaleString('en-IN')} / month</td></tr>
      <tr><td><strong>Daily Allowance (Session Days)</strong></td><td>₹${salary.daily_allowance.toLocaleString('en-IN')} / day</td></tr>
      <tr><td><strong>Housing Facility & Residence</strong></td><td>${salary.housing}</td></tr>
      <tr><td><strong>Official Vehicle & Transport</strong></td><td>${salary.vehicle}</td></tr>
      <tr><td><strong>Security Detail Category</strong></td><td>${salary.security}</td></tr>
      <tr><td><strong>Medical Benefits</strong></td><td>${salary.medical}</td></tr>
      <tr><td><strong>Pension Eligibility</strong></td><td>${salary.pension}</td></tr>
      <tr><td><strong>Communication & Internet</strong></td><td>${salary.telephone} | ${salary.internet}</td></tr>
      <tr><td><strong>Other Government Benefits</strong></td><td>${salary.other_benefits}</td></tr>
    </tbody>
  </table>

  <div class="disclaimer">
    <strong>Disclaimer:</strong> Salary and allowances are based on officially published government notifications. Actual amounts may vary according to revisions, state-specific rules, allowances, and government orders.
  </div>

  <div style="margin-top: 20px; text-align: center;" class="no-print">
    <button onclick="window.print()" style="padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
      Print / Save as PDF
    </button>
  </div>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
