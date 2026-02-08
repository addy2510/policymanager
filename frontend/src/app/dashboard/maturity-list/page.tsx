'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, ChevronDown, X, Home, FileText, BarChart3, Calendar, Settings, LogOut } from 'lucide-react';
import { apiCall, downloadFile, SessionExpiredError } from '../../utils/api';
import { usePathname } from 'next/navigation';
import { useSession } from '@/app/context/SessionContext';

type PolicyAny = Record<string, any>;

const printStyles = `
  @media print {
    @page {
      size: landscape;
      margin: 5mm;
    }
    
    html {
      width: 100%;
      height: 100%;
    }
    
    body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 5mm;
      background: white;
    }
    
    .flex { display: none !important; }
    .flex-1 { display: block !important; overflow: visible !important; }
    
    .sidebar-print-hide,
    .filters-print-hide,
    .buttons-print-hide,
    .pagination-print-hide,
    .print-hide,
    .hidden.md\\:block,
    .hidden {
      display: none !important;
    }
    
    .print-table-container {
      display: block !important;
      visibility: visible !important;
      position: relative !important;
      width: 100% !important;
      overflow: visible !important;
    }
    
    .print-table-container h1 {
      margin: 0 0 5px 0;
      font-size: 16px;
      font-weight: bold;
    }
    
    .print-table-container p {
      margin: 0 0 8px 0;
      font-size: 11px;
      color: #666;
    }
    
    .print-table-container table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      page-break-inside: auto;
    }
    
    .print-table-container tbody tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    
    .print-table-container th,
    .print-table-container td {
      border: 1px solid #333;
      padding: 4px 6px;
      text-align: left;
    }
    
    .print-table-container th {
      background-color: #e5e5e5;
      font-weight: bold;
      page-break-inside: avoid;
    }
  }
`;

export default function MaturityList() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const { handleSessionExpiry } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState('Admin');
  const [selectedDate, setSelectedDate] = useState('2026-01-16');
  const [maturityFromDate, setMaturityFromDate] = useState('2026-01-01');
  const [maturityToDate, setMaturityToDate] = useState('2026-01-31');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [maturityPolicies, setMaturityPolicies] = useState<PolicyAny[]>([]);
  const [allPolicies, setAllPolicies] = useState<PolicyAny[]>([]); // master copy for search/reset
  const [columns, setColumns] = useState<string[]>([]);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(maturityPolicies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPolicies = maturityPolicies.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.username);
    } else {
      router.push('/');
    }
  }, [router]);

  const handleFetchRecords = async () => {
    // Validate that at least one date is provided
    if (!maturityFromDate && !maturityToDate) {
      alert('Please provide at least one maturity date (From or To)');
      return;
    }

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (maturityFromDate) {
        params.append('maturityFrom', maturityFromDate);
      }
      if (maturityToDate) {
        params.append('maturityTo', maturityToDate);
      }
      // Add pagination to fetch all records
      params.append('page', '0');
      params.append('size', '2000');

      const queryString = params.toString();
      console.log('Fetching with query:', queryString);
      
      // Call API endpoint - apiCall handles Authorization header automatically
      const response = await apiCall(`/api/v1/policy/maturity?${queryString}`, {
        method: 'GET',
      });

      console.log('Maturity response:', response);

      if (response.content && Array.isArray(response.content)) {
        // Map API response to MaturityPolicy interface
        const mappedPolicies = response.content.map((policy: any) => ({
          id: policy.id || Math.random(),
          policyNo: policy.policyNumber || policy.policyNo || '',
          customerName: policy.personName || policy.customerName || '',
          policyType: policy.product || policy.policyType || '',
          maturityDate: policy.maturityDate || '',
          amount: policy.sumAssured || policy.amount || 0,
          status: policy.status || 'Pending',
          ...policy
        }));
        setMaturityPolicies(mappedPolicies);
        setAllPolicies(mappedPolicies);
        // compute columns from union of keys
        const cols = Array.from(mappedPolicies.reduce((acc: Set<string>, p: any) => {
          Object.keys(p).forEach(k => acc.add(k));
          return acc;
        }, new Set<string>())) as string[];
        setColumns(cols);
      } else if (Array.isArray(response)) {
        // If response is directly an array
        const mappedPolicies = response.map((policy: any) => ({
          id: policy.id || Math.random(),
          policyNo: policy.policyNumber || policy.policyNo || '',
          customerName: policy.personName || policy.customerName || '',
          policyType: policy.product || policy.policyType || '',
          maturityDate: policy.maturityDate || '',
          amount: policy.sumAssured || policy.amount || 0,
          status: policy.status || 'Pending',
          ...policy
        }));
        setMaturityPolicies(mappedPolicies);
        setAllPolicies(mappedPolicies);
        const cols = Array.from(mappedPolicies.reduce((acc: Set<string>, p: any) => {
          Object.keys(p).forEach(k => acc.add(k));
          return acc;
        }, new Set<string>())) as string[];
        setColumns(cols);
      } else {
        alert('No policies found for the selected date range.');
        setMaturityPolicies([]);
        setAllPolicies([]);
        setColumns([]);
      }
      setCurrentPage(1);
    } catch (error: any) {
      if (error instanceof SessionExpiredError) {
        console.log('Session expired, redirecting to login...');
        handleSessionExpiry();
      } else {
        console.error('Error fetching maturity records:', error);
        alert(`Error fetching records: ${error.message}`);
        setMaturityPolicies([]);
        setAllPolicies([]);
        setColumns([]);
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term) {
      const filtered = allPolicies.filter(policy =>
        Object.values(policy)
          .filter(v => v !== null && v !== undefined)
          .map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v)).toLowerCase())
          .join(' ')
          .includes(term)
      );
      setMaturityPolicies(filtered);
    } else {
      setMaturityPolicies(allPolicies.slice());
    }
    setCurrentPage(1);
  };

  const handleDownloadCSV = () => {
    // use dynamic columns (fallback to keys of first record)
    const cols = getFilteredColumns(columns.length > 0 ? columns : (maturityPolicies[0] ? Object.keys(maturityPolicies[0]) : []));
    const headers = cols;
    const rows = maturityPolicies.map(p =>
      cols.map((c) => {
        const v = p[c];
        if (v === null || v === undefined) return '';
        if (typeof v === 'object') return JSON.stringify(v);
        if (typeof v === 'number' && /amount|sum/i.test(c)) return `₹ ${(v / 100000).toFixed(2)}`;
        return String(v);
      })
    );

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'maturity-list.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = async () => {
    try {
      // Ensure we have records to download; if not, fetch them first
      if (maturityPolicies.length === 0) {
        await handleFetchRecords();
      }

      if (maturityPolicies.length === 0) {
        alert('No policies available to download. Fetch records first.');
        return;
      }

      // Use all data fields for Excel export
      const requests = maturityPolicies.map((p) => p);

      await downloadFile('/api/v1/policy/download-all-policies-excel', 'maturity-list.xlsx', {
        method: 'POST',
        body: requests,
      });
    } catch (error: any) {
      console.error('Error downloading Excel:', error);
      alert(`Error downloading Excel: ${error.message || JSON.stringify(error)}`);
    }
  };

  const handlePrint = () => {
    // Add landscape orientation instruction
    const printWindows = window.open('', 'print-window');
    if (printWindows) {
      // Get the print table HTML
      const printTableElement = document.querySelector('.print-table-container');
      if (printTableElement) {
        const printContent = printTableElement.outerHTML;
        printWindows.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              @page { size: landscape; margin: 5mm; }
              body { margin: 0; padding: 10mm; font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; font-size: 9px; }
              th, td { border: 1px solid #333; padding: 4px 6px; text-align: left; }
              th { background-color: #e5e5e5; font-weight: bold; }
              h1 { margin: 0 0 5px 0; font-size: 16px; }
              p { margin: 0 0 8px 0; font-size: 11px; color: #666; }
              tr { page-break-inside: avoid; }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
          </html>
        `);
        printWindows.document.close();
        printWindows.print();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const totalAmount = maturityPolicies.reduce((sum, policy) => {
    const amountKeys = ['amount', 'sumAssured', 'sum', 'sum_assured', 'sumassured'];
    let val: number | undefined;
    for (const k of amountKeys) {
      if (typeof policy[k] === 'number') {
        val = policy[k];
        break;
      }
    }
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);

  const formatHeader = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  };

  const getFilteredColumns = (cols: string[]) => {
    // Exclude 'id' and duplicate columns
    const duplicates: { [key: string]: string[] } = {
      policyNo: ['policyNumber', 'policynumber'],
      customerName: ['personName', 'personname'],
      amount: ['sumAssured', 'sumasured', 'sum'],
    };

    return cols.filter((col) => {
      if (col.toLowerCase() === 'id') return false;
      // Check if this column is a duplicate of a primary column
      for (const [primary, dupes] of Object.entries(duplicates)) {
        if (dupes.some(d => d.toLowerCase() === col.toLowerCase()) && cols.includes(primary)) {
          return false;
        }
      }
      return true;
    });
  };

  useEffect(() => {
    // Inject print styles
    const style = document.createElement('style');
    style.innerHTML = printStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`sidebar-print-hide ${sidebarOpen ? 'w-48' : 'w-20'} bg-slate-700 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-600">
          <div className="bg-blue-500 p-2 rounded">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1C6.48 1 2 4.58 2 9v10c0 4.42 4.48 8 10 8s10-3.58 10-8V9c0-4.42-4.48-8-10-8zm0 2c4.41 0 8 2.69 8 6v10c0 3.31-3.59 6-8 6s-8-2.69-8-6V9c0-3.31 3.59-6 8-6zm3.5 9c.83 0 1.5.67 1.5 1.5S16.33 15 15.5 15 14 14.33 14 13.5s.67-1.5 1.5-1.5zm-7 0c.83 0 1.5.67 1.5 1.5S9.33 15 8.5 15 7 14.33 7 13.5 7.67 12 8.5 12z" />
            </svg>
          </div>
          {sidebarOpen && <span className="font-bold text-lg">Menu</span>}
          </div>
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div
            onClick={() => router.push('/dashboard')}
            className={pathname === '/dashboard' || pathname === '/' ? 'flex items-center gap-3 px-4 py-3 bg-blue-600 rounded' : 'flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer'}
          >
            <Home size={20} />
            {sidebarOpen && <span>Dashboard</span>}
          </div>
          <div
            onClick={() => router.push('/dashboard/new-policy')}
            className={pathname?.startsWith('/dashboard/new-policy') ? 'flex items-center gap-3 px-4 py-3 bg-blue-600 rounded' : 'flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer'}
          >
            <FileText size={20} />
            {sidebarOpen && <span>Policies</span>}
          </div>
          <div
            onClick={() => router.push('/dashboard/view-records')}
            className={pathname?.startsWith('/dashboard/view-records') ? 'flex items-center gap-3 px-4 py-3 bg-blue-600 rounded' : 'flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer'}
          >
            <BarChart3 size={20} />
            {sidebarOpen && <span>Records</span>}
          </div>
          <div
            onClick={() => router.push('/dashboard/maturity-list')}
            className={pathname?.startsWith('/dashboard/maturity-list') ? 'flex items-center gap-3 px-4 py-3 bg-blue-600 rounded' : 'flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer'}
          >
            <Calendar size={20} />
            {sidebarOpen && <span>Maturity List</span>}
          </div>
          <div
            onClick={() => router.push('/dashboard/update-policy')}
            className={pathname?.startsWith('/dashboard/update-policy') ? 'flex items-center gap-3 px-4 py-3 bg-blue-600 rounded' : 'flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer'}
          >
            <Settings size={20} />
            {sidebarOpen && <span>Update</span>}
          </div>
        </nav>

        {/* Logout */}
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 px-4 py-3 w-full hover:bg-slate-600 rounded border-t border-slate-600"
        >
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        {/* Header */}
        <div className="bg-white shadow px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Maturity List</h1>
          <div className="flex items-center gap-3">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-10 h-10 rounded-full" />
            <span className="text-gray-700 font-semibold">{userName}</span>
            <ChevronDown size={20} className="text-gray-600" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 w-full min-w-0">
          <p className="text-gray-600 mb-6 print-hide">View and download policies maturing on a selected date</p>

          {/* Date and Action Buttons */}
          <div className="buttons-print-hide bg-white rounded-lg shadow p-6 mb-6 overflow-x-auto">
            <div className="flex items-center gap-4 mb-4 min-w-max">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <label className="font-semibold text-gray-700">Maturity From:</label>
                <input
                  type="date"
                  value={maturityFromDate}
                  onChange={(e) => setMaturityFromDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-gray-800"
                />
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <label className="font-semibold text-gray-700">Maturity To:</label>
                <input
                  type="date"
                  value={maturityToDate}
                  onChange={(e) => setMaturityToDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-gray-800"
                />
              </div>
              <button
                onClick={handleFetchRecords}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold"
              >
                Fetch Records
              </button>
              <button
                onClick={handleDownloadCSV}
                className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 font-semibold"
              >
                Download CSV
              </button>
              <button
                onClick={handleDownloadExcel}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold"
              >
                Download Excel
              </button>
              <button
                onClick={handlePrint}
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 font-semibold"
              >
                Print
              </button>
            </div>

            {/* Statistics */}
            <div className="flex gap-8 pt-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span className="text-gray-700"><strong>Total Policies:</strong> {maturityPolicies.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-700"><strong>Total Amount:</strong> ₹ {(totalAmount / 100000).toFixed(2)} L</span>
              </div>
            </div>
          </div>

          {/* Table / Mobile list */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Desktop table (md and up) */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    {getFilteredColumns(columns.length > 0 ? columns : (paginatedPolicies[0] ? Object.keys(paginatedPolicies[0]) : [])).map((col) => (
                      <th key={col} className="px-6 py-3 text-left text-gray-700 font-semibold">{formatHeader(col)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedPolicies.map((policy, rowIdx) => (
                    <tr key={policy.id ?? rowIdx} className="border-b border-gray-200 hover:bg-gray-50">
                      {getFilteredColumns(columns.length > 0 ? columns : Object.keys(policy)).map((col) => {
                        const raw = policy[col];
                        let display = '';
                        if (raw === null || raw === undefined) display = '';
                        else if (typeof raw === 'object') display = JSON.stringify(raw);
                        else if (typeof raw === 'number' && /amount|sum/i.test(col)) display = `₹ ${(raw / 100000).toFixed(2)} L`;
                        else display = String(raw);

                        const isAddressCol = col.toLowerCase().includes('address');
                        return (
                          <td key={col} className={`px-6 py-3 text-gray-800 ${isAddressCol ? 'min-w-[250px]' : ''}`}>
                            {col.toLowerCase().includes('policy') ? (
                              <span className="text-blue-600 cursor-pointer hover:underline">{display}</span>
                            ) : col.toLowerCase().includes('status') ? (
                              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded text-sm font-semibold">{display}</span>
                            ) : (
                              display
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Print-only table with all records and columns */}
            <div className="print-table-container hidden">
              <h1 className="text-2xl font-bold mb-4">Maturity List Report</h1>
              <p className="text-sm text-gray-600 mb-4">Generated on {new Date().toLocaleDateString()}</p>
              <table>
                <thead>
                  <tr>
                    {(columns.length > 0 ? columns : (maturityPolicies[0] ? Object.keys(maturityPolicies[0]) : [])).map((col) => (
                      <th key={col}>{formatHeader(col)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {maturityPolicies.map((policy, rowIdx) => (
                    <tr key={policy.id ?? rowIdx}>
                      {(columns.length > 0 ? columns : Object.keys(policy)).map((col) => {
                        const raw = policy[col];
                        let display = '';
                        if (raw === null || raw === undefined) display = '';
                        else if (typeof raw === 'object') display = JSON.stringify(raw);
                        else if (typeof raw === 'number' && /amount|sum/i.test(col)) display = `₹ ${(raw / 100000).toFixed(2)} L`;
                        else display = String(raw);

                        return (
                          <td key={col}>
                            {col.toLowerCase().includes('policy') ? (
                              <span className="text-blue-600">{display}</span>
                            ) : col.toLowerCase().includes('status') ? (
                              <span className="bg-emerald-100 text-emerald-800">{display}</span>
                            ) : (
                              display
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Original print-only table with filtered columns */}
            <div className="print:block hidden overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    {getFilteredColumns(columns.length > 0 ? columns : (maturityPolicies[0] ? Object.keys(maturityPolicies[0]) : [])).map((col) => (
                      <th key={col} className="px-6 py-3 text-left text-gray-700 font-semibold">{formatHeader(col)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {maturityPolicies.map((policy, rowIdx) => (
                    <tr key={policy.id ?? rowIdx} className="border-b border-gray-200">
                      {getFilteredColumns(columns.length > 0 ? columns : Object.keys(policy)).map((col) => {
                        const raw = policy[col];
                        let display = '';
                        if (raw === null || raw === undefined) display = '';
                        else if (typeof raw === 'object') display = JSON.stringify(raw);
                        else if (typeof raw === 'number' && /amount|sum/i.test(col)) display = `₹ ${(raw / 100000).toFixed(2)} L`;
                        else display = String(raw);

                        const isAddressCol = col.toLowerCase().includes('address');
                        return (
                          <td key={col} className={`px-6 py-3 text-gray-800 ${isAddressCol ? 'min-w-[250px]' : ''}`}>
                            {col.toLowerCase().includes('policy') ? (
                              <span className="text-blue-600">{display}</span>
                            ) : col.toLowerCase().includes('status') ? (
                              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded text-sm font-semibold">{display}</span>
                            ) : (
                              display
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards (sm screens) */}
            <div className="md:hidden p-4 space-y-3">
              {paginatedPolicies.map((policy, idx) => (
                <div key={policy.id ?? idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-gray-500">{formatHeader(columns[0] ?? 'Policy')}</div>
                      <div className="text-lg font-semibold text-blue-600">{policy.policyNo ?? policy.policyNumber ?? ''}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{formatHeader('maturityDate')}</div>
                      <div className="font-semibold">{policy.maturityDate ?? ''}</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
                    {getFilteredColumns(columns.length > 0 ? columns : Object.keys(policy)).map((col) => {
                      const raw = policy[col];
                      let display = '';
                      if (raw === null || raw === undefined) display = '';
                      else if (typeof raw === 'object') display = JSON.stringify(raw);
                      else if (typeof raw === 'number' && /amount|sum/i.test(col)) display = `₹ ${(raw / 100000).toFixed(2)} L`;
                      else display = String(raw);

                      return (
                        <div key={col} className="flex flex-col">
                          <span className="text-xs text-gray-500">{formatHeader(col)}</span>
                          <span className={`text-sm ${col.toLowerCase().includes('status') ? 'font-semibold' : ''}`}>{display}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination-print-hide px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-gray-800 font-semibold">Showing {maturityPolicies.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, maturityPolicies.length)} of {maturityPolicies.length} entries</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, idx, arr) => (
                    <React.Fragment key={page}>
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span className="px-2 py-1 text-gray-800">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded font-semibold ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-100 text-gray-800'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
