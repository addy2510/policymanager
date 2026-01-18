'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, Home, FileText, BarChart3, Calendar, Settings, Search } from 'lucide-react';

interface PolicyRecord {
  id: string;
  policyNo: string;
  customerName: string;
  groupCode: string;
  policyType: string;
  startDate: string;
  status: 'Active' | 'Matured' | 'Lapsed';
}

export default function ViewRecords() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allRecords] = useState<PolicyRecord[]>([
    { id: '1', policyNo: 'CC123456', customerName: 'John Doe', groupCode: 'GO01', policyType: 'Endowment Plan', startDate: '20-Jan-2020', status: 'Active' },
    { id: '2', policyNo: 'AN654321', customerName: 'Anita Nair', groupCode: 'GO02', policyType: 'Money Back Plan', startDate: '20-Jan-2020', status: 'Active' },
    { id: '3', policyNo: 'DH789012', customerName: 'Devendra Hegde', groupCode: 'GO03', policyType: 'Term Plan', startDate: '24-Jan-2020', status: 'Matured' },
    { id: '4', policyNo: 'BG345678', customerName: 'Ravi Chawla', groupCode: 'GO03', policyType: 'ULIP', startDate: '23-Jan-2020', status: 'Active' },
    { id: '5', policyNo: 'RC876543', customerName: 'Bharat Gupta', groupCode: 'GO02', policyType: 'Endowment Plan', startDate: '20-Jan-2020', status: 'Active' },
    { id: '6', policyNo: 'JS556890', customerName: 'Priya Kapoor', groupCode: 'GO03', policyType: 'Money Back Plan', startDate: '29-Jan-2020', status: 'Active' },
    { id: '7', policyNo: 'VG873567', customerName: 'Lakshmi Patel', groupCode: 'GO03', policyType: 'Term Plan', startDate: '22-Jan-2020', status: 'Matured' },
    { id: '8', policyNo: 'LP234567', customerName: 'Deepak Saxena', groupCode: 'GO03', policyType: 'ULIP', startDate: '26-Dec-2019', status: 'Active' },
    { id: '9', policyNo: 'DS890123', customerName: 'Deepak Saxena', groupCode: 'GO03', policyType: 'Money Back Plan', startDate: '26-Dec-2019', status: 'Matured' },
  ]);

  const [records, setRecords] = useState<PolicyRecord[]>(allRecords);
  const [filterPolicyNo, setFilterPolicyNo] = useState('');
  const [filterGroupCode, setFilterGroupCode] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleFilterRecords = () => {
    // Filter logic
    let filtered = allRecords;

    if (filterPolicyNo.trim()) {
      filtered = filtered.filter(record =>
        record.policyNo.toLowerCase().includes(filterPolicyNo.toLowerCase())
      );
    }

    if (filterGroupCode) {
      filtered = filtered.filter(record =>
        record.groupCode === filterGroupCode
      );
    }

    setRecords(filtered);
    setCurrentPage(1); // Reset to first page
  };

  const handleClearFilters = () => {
    setFilterPolicyNo('');
    setFilterGroupCode('');
    setRecords(allRecords);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500 text-white';
      case 'Matured':
        return 'bg-amber-500 text-white';
      case 'Lapsed':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Calculate statistics
  const totalPolicies = records.length;
  const activePolicies = records.filter(r => r.status === 'Active').length;
  const maturedPolicies = records.filter(r => r.status === 'Matured').length;
  const lapsedPolicies = records.filter(r => r.status === 'Lapsed').length;

  // Pagination
  const totalPages = Math.ceil(records.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = records.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-slate-700 text-white transition-all duration-300 ${sidebarOpen ? 'w-48' : 'w-20'} flex flex-col`}>
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
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded cursor-pointer">
            <BarChart3 size={20} />
            {sidebarOpen && <span>Records</span>}
          </div>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer">
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">View Policy Records</h1>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
              alt="User"
              className="w-8 h-8 rounded-full"
            />
            <span className="font-semibold text-gray-700">Admin</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg shadow-xl p-6">
            {/* Description */}
            <p className="text-gray-600 mb-6">View all records of policies using paginate data</p>

            {/* Filter Section */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-48">
                <label className="block text-gray-700 font-semibold mb-2">Policy No</label>
                <select
                  value={filterPolicyNo}
                  onChange={(e) => setFilterPolicyNo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                >
                  <option value="">Select Policy No</option>
                  {allRecords.map(record => (
                    <option key={record.id} value={record.policyNo}>{record.policyNo}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-48">
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Group Code
                </label>
                <select
                  value={filterGroupCode}
                  onChange={(e) => setFilterGroupCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                >
                  <option value="">Select Group Code</option>
                  <option value="GO01">GO01</option>
                  <option value="GO02">GO02</option>
                  <option value="GO03">GO03</option>
                </select>
              </div>
              <button
                onClick={handleFilterRecords}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Filter Records
              </button>
              <button
                onClick={handleClearFilters}
                className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Clear Filters
              </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-gray-600 text-sm">Total Policies</p>
                  <p className="text-lg font-bold text-blue-600">{totalPolicies}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <div>
                  <p className="text-gray-600 text-sm">Active Policies</p>
                  <p className="text-lg font-bold text-emerald-600">{activePolicies}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div>
                  <p className="text-gray-600 text-sm">Matured Policies</p>
                  <p className="text-lg font-bold text-amber-600">{maturedPolicies}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div>
                  <p className="text-gray-600 text-sm">Lapsed Policies</p>
                  <p className="text-lg font-bold text-red-600">{lapsedPolicies}</p>
                </div>
              </div>
            </div>

            {/* Table Info */}
            <div className="flex items-center gap-4 mb-4">
              <p className="text-gray-700 font-semibold">Policies: {totalPolicies}</p>
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                </svg>
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Policy No</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Customer Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Group Code</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Policy Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Start Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">{record.policyNo}</td>
                      <td className="px-4 py-3 text-gray-800">{record.customerName}</td>
                      <td className="px-4 py-3 text-gray-800">{record.groupCode}</td>
                      <td className="px-4 py-3 text-gray-800">{record.policyType}</td>
                      <td className="px-4 py-3 text-gray-800">{record.startDate}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-blue-600 hover:text-blue-800 font-semibold">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-gray-600">Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, records.length)} of {records.length} entries</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded">
                  &laquo;
                </button>
                <select value={itemsPerPage} className="px-3 py-1 border border-gray-300 rounded">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded">
                  &nbsp;
                </button>
                <button className="px-2 py-1 text-gray-600">←</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded font-semibold ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button className="px-2 py-1 text-gray-600">→</button>
                <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded">Previous</button>
                <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded">{currentPage}</button>
                <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

