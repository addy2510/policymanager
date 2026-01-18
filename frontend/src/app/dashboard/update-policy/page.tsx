'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, Home, FileText, BarChart3, Calendar, Settings, AlertCircle, X, ChevronDown } from 'lucide-react';

interface PolicyDetails {
  policyNo: string;
  customerName: string;
  policyType: string;
  startDate: string;
  premiumAmount: string;
  maturityDate: string;
  premiumFrequency: string;
  policyStatus: string;
}

interface FormData extends PolicyDetails {
  updateCustomerName: string;
  updatePolicyType: string;
  updatePremiumAmount: string;
  updateMaturityDate: string;
  updatePremiumFrequency: string;
}

interface User {
  username: string;
  rememberMe: boolean;
}

export default function UpdatePolicy() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchPolicyNo, setSearchPolicyNo] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    policyNo: '',
    customerName: '',
    policyType: 'Money Back Plan',
    startDate: '',
    premiumAmount: '',
    maturityDate: '',
    premiumFrequency: 'Yearly',
    policyStatus: 'Active',
    updateCustomerName: '',
    updatePolicyType: 'Money Back Plan',
    updatePremiumAmount: '',
    updateMaturityDate: '',
    updatePremiumFrequency: 'Yearly',
  });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
    } else {
      setUser(JSON.parse(userData));
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  // Mock policy data
  const mockPolicies: Record<string, PolicyDetails> = {
    'LP234567': {
      policyNo: 'LP234567',
      customerName: 'Lakshmi Patel',
      policyType: 'Money Back Plan',
      startDate: '15-Feb-2020',
      premiumAmount: '15,000',
      maturityDate: '15-Feb-2028',
      premiumFrequency: 'Yearly',
      policyStatus: 'Active',
    },
  };

  const handleSearch = () => {
    const policy = mockPolicies[searchPolicyNo];
    if (policy) {
      setFormData({
        ...policy,
        updateCustomerName: policy.customerName,
        updatePolicyType: policy.policyType,
        updatePremiumAmount: policy.premiumAmount,
        updateMaturityDate: policy.maturityDate,
        updatePremiumFrequency: policy.premiumFrequency,
      });
      setShowDetails(true);
    } else {
      alert('Policy not found');
      setShowDetails(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = () => {
    setShowConfirm(true);
  };

  const handleConfirmUpdate = () => {
    setShowConfirm(false);
    alert('Policy updated successfully!');
    setShowDetails(false);
    setSearchPolicyNo('');
    setFormData({
      policyNo: '',
      customerName: '',
      policyType: 'Money Back Plan',
      startDate: '',
      premiumAmount: '',
      maturityDate: '',
      premiumFrequency: 'Yearly',
      policyStatus: 'Active',
      updateCustomerName: '',
      updatePolicyType: 'Money Back Plan',
      updatePremiumAmount: '',
      updateMaturityDate: '',
      updatePremiumFrequency: 'Yearly',
    });
  };

  const handleCancel = () => {
    setShowDetails(false);
    setSearchPolicyNo('');
    setFormData({
      policyNo: '',
      customerName: '',
      policyType: 'Money Back Plan',
      startDate: '',
      premiumAmount: '',
      maturityDate: '',
      premiumFrequency: 'Yearly',
      policyStatus: 'Active',
      updateCustomerName: '',
      updatePolicyType: 'Money Back Plan',
      updatePremiumAmount: '',
      updateMaturityDate: '',
      updatePremiumFrequency: 'Yearly',
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

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
          <div 
            onClick={() => router.push('/dashboard/view-records')}
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer"
          >
            <BarChart3 size={20} />
            {sidebarOpen && <span>Records</span>}
          </div>
          <div 
            onClick={() => router.push('/dashboard/maturity-list')}
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer"
          >
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
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                alt={user?.username || 'User'}
                className="w-8 h-8 rounded-full"
              />
              <span className="font-semibold text-gray-700">{user?.username || 'User'}</span>
              <ChevronDown size={18} className="text-gray-500" />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Update Policy</h1>
            <p className="text-gray-600 mb-6">Modify details of an existing insurance policy</p>

            {/* Search Section */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-700 font-semibold mb-2">Enter Policy Number:</label>
                <input
                  type="text"
                  value={searchPolicyNo}
                  onChange={(e) => setSearchPolicyNo(e.target.value)}
                  placeholder="e.g., LP234567"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-800 placeholder:text-gray-500 bg-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-semibold"
                >
                  Search
                </button>
              </div>
            </div>

            {showDetails && (
              <>
                {/* Current Details */}
                <div className="mb-8 bg-gray-50 p-6 rounded">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Update Policy</h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Policy No:</label>
                      <p className="text-gray-800">{formData.policyNo}</p>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Customer Name:</label>
                      <p className="text-gray-800">{formData.customerName}</p>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Policy Type:</label>
                      <p className="text-gray-800">{formData.policyType}</p>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Start Date:</label>
                      <p className="text-gray-800">{formData.startDate}</p>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Premium Amount:</label>
                      <p className="text-gray-800">₹ {formData.premiumAmount}</p>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Maturity Date:</label>
                      <p className="text-gray-800">{formData.maturityDate}</p>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Premium Frequency:</label>
                      <p className="text-gray-800">{formData.premiumFrequency}</p>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Policy Status:</label>
                      <p className="text-green-600 font-semibold">{formData.policyStatus}</p>
                    </div>
                  </div>
                </div>

                {/* Edit Section */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Customer Name:</label>
                    <input
                      type="text"
                      name="updateCustomerName"
                      value={formData.updateCustomerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-800 placeholder:text-gray-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Premium Amount:</label>
                    <div className="flex items-center">
                      <span className="mr-2 text-gray-700">₹</span>
                      <input
                        type="text"
                        name="updatePremiumAmount"
                        value={formData.updatePremiumAmount}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-800 placeholder:text-gray-500 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Policy Type:</label>
                    <select
                      name="updatePolicyType"
                      value={formData.updatePolicyType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-800 bg-white"
                    >
                      <option>Money Back Plan</option>
                      <option>Endowment Plan</option>
                      <option>ULIP</option>
                      <option>Term Plan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Maturity Date:</label>
                    <input
                      type="date"
                      name="updateMaturityDate"
                      value={formData.updateMaturityDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Premium Frequency:</label>
                    <select
                      name="updatePremiumFrequency"
                      value={formData.updatePremiumFrequency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-800 bg-white"
                    >
                      <option>Yearly</option>
                      <option>Half-Yearly</option>
                      <option>Quarterly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-2 rounded font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle size={32} className="text-yellow-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800 mb-2">Are you sure you want to update this policy?</h2>
                <p className="text-gray-600">This action will permanently modify the policy details.</p>
              </div>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpdate}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold"
              >
                Yes, Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
