'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, Home, FileText, BarChart3, Calendar, Settings, AlertCircle, X, ChevronDown, Edit } from 'lucide-react';
import { apiCall } from '@/app/utils/api';

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
  const handleSearch = async () => {
    if (!searchPolicyNo.trim()) {
      alert('Please enter a policy number');
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('policyNumber', searchPolicyNo.trim());
      params.append('page', '0');
      params.append('size', '1');

      const endpoint = `/api/v1/policy/search?${params.toString()}`;
      const result = await apiCall(endpoint, { method: 'GET' });

      const records = result?.content || [];
      if (records.length === 0) {
        alert('Policy not found');
        setShowDetails(false);
        return;
      }

      const record = records[0];
      setFormData({
        policyNo: record.policyNumber || record.policyNo || '',
        customerName: record.personName || record.customerName || '',
        policyType: record.product || record.policyType || '',
        startDate: record.commencementDate || record.startDate || '',
        premiumAmount: record.premium || record.premiumAmount || '',
        maturityDate: record.maturityDate || '',
        premiumFrequency: record.mode || record.premiumFrequency || 'Y',
        policyStatus: record.status || 'Active',
        updateCustomerName: record.personName || record.customerName || '',
        updatePolicyType: record.product || record.policyType || '',
        updatePremiumAmount: record.premium || record.premiumAmount || '',
        updateMaturityDate: record.maturityDate || '',
        updatePremiumFrequency: record.mode || record.premiumFrequency || 'Y',
      });

      setShowDetails(true);
    } catch (err) {
      console.error('Search error:', err);
      alert('Failed to search policy. Check console for details.');
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

  const handleConfirmUpdate = async () => {
    // Call backend PUT /api/v1/policy/{policyNumber} with changed fields
    try {
      const policyNumber = formData.policyNo;
      if (!policyNumber) {
        alert('Missing policy number');
        return;
      }

      // Build request body with only changed fields
      const body: any = {};

      // personName (customer name)
      if (formData.updateCustomerName && formData.updateCustomerName.trim() !== '' && formData.updateCustomerName !== formData.customerName) {
        body.personName = formData.updateCustomerName.trim();
      }

      // premium
      if (formData.updatePremiumAmount && String(formData.updatePremiumAmount).trim() !== '') {
        const newPremium = Number(String(formData.updatePremiumAmount).replace(/,/g, ''));
        const oldPremium = formData.premiumAmount ? Number(String(formData.premiumAmount).toString().replace(/,/g, '')) : NaN;
        if (!isNaN(newPremium) && newPremium !== oldPremium) {
          body.premium = newPremium;
        }
      }

      // maturityDate
      if (formData.updateMaturityDate && formData.updateMaturityDate !== formData.maturityDate) {
        body.maturityDate = formData.updateMaturityDate;
      }

      // mode (premium frequency)
      if (formData.updatePremiumFrequency && formData.updatePremiumFrequency !== formData.premiumFrequency) {
        body.mode = formData.updatePremiumFrequency;
      }

      // product / policy type
      if (formData.updatePolicyType && formData.updatePolicyType !== formData.policyType) {
        body.product = formData.updatePolicyType;
      }

      // If nothing changed, skip the API call
      if (Object.keys(body).length === 0) {
        setShowConfirm(false);
        alert('No changes detected to update.');
        return;
      }
      console.log('Update body:', body);
      const token = localStorage.getItem('authToken');
      console.log('Token:', token);

      const result = await apiCall(`/api/v1/policy/update/${policyNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      console.log(result);

      setShowConfirm(false);
      
      // Refetch the updated policy
      try {
        const refetchResult = await apiCall(
          `/api/v1/policy/search?policyNumber=${policyNumber}&page=0&size=1`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (refetchResult && refetchResult.content && refetchResult.content.length > 0) {
          const updatedPolicy = refetchResult.content[0];
          setFormData(prev => ({
            ...prev,
            policyNo: updatedPolicy.policyNo || '',
            customerName: updatedPolicy.personName || '',
            policyType: updatedPolicy.product || 'Money Back Plan',
            startDate: updatedPolicy.commencementDate || '',
            premiumAmount: updatedPolicy.premium ? String(updatedPolicy.premium) : '',
            maturityDate: updatedPolicy.maturityDate || '',
            premiumFrequency: updatedPolicy.mode || 'Y',
            policyStatus: updatedPolicy.status || 'Active',
            updateCustomerName: '',
            updatePolicyType: updatedPolicy.product || 'Money Back Plan',
            updatePremiumAmount: '',
            updateMaturityDate: '',
            updatePremiumFrequency: updatedPolicy.mode || 'Y',
          }));
        }
      } catch (refetchError) {
        console.error('Failed to refetch policy:', refetchError);
      }

      // Show success modal
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Update error:', err);
      alert(err instanceof Error ? err.message : 'Failed to update policy');
    }
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

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
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
              <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left - Current Details */}
                <div className="md:col-span-1 bg-gradient-to-b from-blue-50 to-white p-6 rounded shadow-sm">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Policy Details</h2>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div>
                      <div className="text-xs text-gray-500">Policy No</div>
                      <div className="text-gray-800 font-medium">{formData.policyNo}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Customer Name</div>
                      <div className="text-gray-800">{formData.customerName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Policy Type</div>
                      <div className="text-gray-800">{formData.policyType}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Start Date</div>
                      <div className="text-gray-800">{formData.startDate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Premium Amount</div>
                      <div className="text-gray-800">₹ {formData.premiumAmount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Maturity Date</div>
                      <div className="text-gray-800">{formData.maturityDate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Premium Frequency</div>
                      <div className="text-gray-800">{formData.premiumFrequency}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Policy Status</div>
                      <div className="text-green-600 font-semibold">{formData.policyStatus}</div>
                    </div>
                  </div>
                </div>

                {/* Right - Edit Form */}
                <div className="md:col-span-2 bg-white p-6 rounded shadow-sm relative">
                  

                  <div className="grid grid-cols-2 gap-6">
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
                          <option value="Y">Y</option>
                          <option value="H">H</option>
                          <option value="Q">Q</option>
                          <option value="M">M</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end mt-6">
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
                </div>
              </div>
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-scale-up">
            <div className="flex justify-center mb-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-500 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
            <p className="text-gray-600 mb-8">Policy has been updated successfully with the latest changes.</p>
            <button
              onClick={handleCloseSuccessModal}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
