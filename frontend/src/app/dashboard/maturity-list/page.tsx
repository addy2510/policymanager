'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, ChevronDown, X, Home, FileText, BarChart3, Calendar, Settings, LogOut } from 'lucide-react';
import { apiCall } from '../../utils/api';

interface MaturityPolicy {
  id: number;
  policyNo: string;
  customerName: string;
  policyType: string;
  maturityDate: string;
  amount: number;
  status: string;
}

export default function MaturityList() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState('Admin');
  const [selectedDate, setSelectedDate] = useState('2026-01-16');
  const [maturityFromDate, setMaturityFromDate] = useState('2026-01-01');
  const [maturityToDate, setMaturityToDate] = useState('2026-01-31');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [maturityPolicies, setMaturityPolicies] = useState<MaturityPolicy[]>([]);
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
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Authentication token not found. Please login.');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (maturityFromDate) {
        params.append('maturityFrom', maturityFromDate);
      }
      if (maturityToDate) {
        params.append('maturityTo', maturityToDate);
      }

      // Call API endpoint
      const response = await apiCall(`/api/v1/policy/maturity?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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
      } else {
        alert('No policies found for the selected date range.');
        setMaturityPolicies([]);
      }
      setCurrentPage(1);
    } catch (error: any) {
      console.error('Error fetching maturity records:', error);
      alert(`Error fetching records: ${error.message}`);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term) {
      const filtered = maturityPolicies.filter(policy =>
        policy.policyNo.toLowerCase().includes(term) ||
        policy.customerName.toLowerCase().includes(term)
      );
      setMaturityPolicies(filtered);
    } else {
      setMaturityPolicies([]);
    }
    setCurrentPage(1);
  };

  const handleDownloadCSV = () => {
    const headers = ['Policy No', 'Customer Name', 'Policy Type', 'Maturity Date', 'Amount', 'Status'];
    const rows = maturityPolicies.map(p => [
      p.policyNo,
      p.customerName,
      p.policyType,
      p.maturityDate,
      `₹ ${(p.amount / 100000).toFixed(2)}`,
      p.status
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'maturity-list.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = () => {
    alert('Excel download feature will be integrated with backend API');
  };

  const handlePrint = () => {
    // Hide elements that should not be printed
    const printHides = document.querySelectorAll('.print-hide, .sidebar-print-hide, .filters-print-hide, .buttons-print-hide, .pagination-print-hide');
    const originalDisplay: { element: Element; display: string }[] = [];
    
    printHides.forEach((element) => {
      originalDisplay.push({ element, display: (element as HTMLElement).style.display });
      (element as HTMLElement).style.display = 'none';
    });
    
    // Trigger print
    window.print();
    
    // Restore hidden elements
    originalDisplay.forEach(({ element, display }) => {
      (element as HTMLElement).style.display = display;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const totalAmount = maturityPolicies.reduce((sum, policy) => sum + policy.amount, 0);

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
          {sidebarOpen && <span className="font-bold text-lg">Dashboard</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer"
          >
            <Home size={20} />
            {sidebarOpen && <span>Dashboard</span>}
          </div>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer">
            <FileText size={20} />
            {sidebarOpen && <span>Policies</span>}
          </div>
          <div 
            onClick={() => router.push('/dashboard/view-records')}
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer"
          >
            <BarChart3 size={20} />
            {sidebarOpen && <span>Records</span>}
          </div>
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded cursor-pointer">
            <Calendar size={20} />
            {sidebarOpen && <span>Maturity List</span>}
          </div>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer">
            <Settings size={20} />
            {sidebarOpen && <span>Settings</span>}
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
      <div className="flex-1 flex flex-col">
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
        <div className="flex-1 overflow-auto p-8">
          <p className="text-gray-600 mb-6 print-hide">View and download policies maturing on a selected date</p>

          {/* Date and Action Buttons */}
          <div className="buttons-print-hide bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <label className="font-semibold text-gray-700">Maturity From:</label>
                <input
                  type="date"
                  value={maturityFromDate}
                  onChange={(e) => setMaturityFromDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-gray-800"
                />
              </div>
              <div className="flex items-center gap-2">
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

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Policy No</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Customer Name</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Policy Type</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Maturity Date</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPolicies.map((policy) => (
                  <tr key={policy.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-800">
                      <span className="text-blue-600 cursor-pointer hover:underline">{policy.policyNo}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-800">{policy.customerName}</td>
                    <td className="px-6 py-3 text-gray-800">{policy.policyType}</td>
                    <td className="px-6 py-3 text-gray-800">{policy.maturityDate}</td>
                    <td className="px-6 py-3 text-gray-800">₹ {(policy.amount / 100000).toFixed(2)} L</td>
                    <td className="px-6 py-3">
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded text-sm font-semibold">
                        {policy.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination-print-hide px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-gray-600">Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, maturityPolicies.length)} of {maturityPolicies.length} entries</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
