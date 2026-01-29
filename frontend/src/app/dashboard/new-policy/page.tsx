'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, ChevronDown, X, Home, FileText, BarChart3, Calendar, Settings, LogOut } from 'lucide-react';
import { apiCall } from '@/app/utils/api';

export default function NewPolicy() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    policyNo: '',
    groupCode: '',
    groupHead: '',
    fup: '',
    term: '',
    address: '',
    product: '',
    mode: '',
    maturityDate: '',
    commencementDate: '',
    sumAssured: '',
    premium: '',
    policyHolder: '',
    dob: '',
    policyStatus: 'Active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.policyNo.trim()) newErrors.policyNo = 'Policy No is required';
    if (!formData.groupHead.trim()) newErrors.groupHead = 'Group Head is required';
    if (!formData.fup) newErrors.fup = 'FUP is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.maturityDate) newErrors.maturityDate = 'Maturity Date is required';
    if (!formData.commencementDate) newErrors.commencementDate = 'Commencement Date is required';
    if (!formData.sumAssured.trim()) newErrors.sumAssured = 'Sum Assured is required';
    if (!formData.premium.trim()) newErrors.premium = 'Premium is required';
    if (!formData.policyHolder.trim()) newErrors.policyHolder = 'Policy Holder is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      setApiError('');
      
      try {
        const token = localStorage.getItem('authToken');

        // Map frontend form fields to backend PolicyRequest fields
        const requestBody: any = {
          policyNumber: formData.policyNo ? Number(String(formData.policyNo).replace(/,/g, '')) : undefined,
          personName: formData.policyHolder || undefined,
          groupCode: formData.groupCode || undefined,
          groupHead: formData.groupHead || undefined,
          fup: formData.fup || undefined,
          term: formData.term || undefined,
          address: formData.address || undefined,
          product: formData.product || undefined,
          mode: formData.mode || undefined,
          dob: formData.dob || undefined,
          maturityDate: formData.maturityDate || undefined,
          commencementDate: formData.commencementDate || undefined,
          sumAssured: formData.sumAssured ? Number(String(formData.sumAssured).replace(/,/g, '')) : undefined,
          premium: formData.premium ? Number(String(formData.premium).replace(/,/g, '')) : undefined,
        };

        // Remove undefined props
        Object.keys(requestBody).forEach(k => requestBody[k] === undefined && delete requestBody[k]);

        console.log('requestBody', requestBody);

        const result = await apiCall('/api/v1/policy/createPolicy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(requestBody),
        });

        console.log('Policy created successfully:', result);
        playNotificationSound();
        setShowSuccessModal(true);
      } catch (err) {
        console.error('Error creating policy:', err);
        setApiError(err instanceof Error ? err.message : 'Failed to create policy');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    router.push('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

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
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer">
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
            <h1 className="text-2xl font-bold text-gray-800">New Policy</h1>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
              alt="User"
              className="w-8 h-8 rounded-full"
            />
            <span className="font-semibold text-gray-700">Admin</span>
            <ChevronDown size={18} className="text-gray-500" />
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg shadow-xl p-8">
            {/* Page Title and Description */}
            <div className="mb-8">
              <p className="text-gray-600">Enter the details to create a new insurance policy record</p>
            </div>

            {/* API Error Message */}
            {apiError && (
              <div className="bg-red-500/10 border border-red-500 text-red-700 p-3 rounded-lg mb-6 text-sm">
                {apiError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSavePolicy} className="space-y-6">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Policy No */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Policy No:
                  </label>
                  <input
                    type="text"
                    name="policyNo"
                    value={formData.policyNo}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-700 ${
                      errors.policyNo ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.policyNo && <p className="text-red-500 text-sm mt-1">{errors.policyNo}</p>}
                </div>

                {/* Group Code */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Group Code: <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="groupCode"
                    value={formData.groupCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-700"
                  />
                </div>

                {/* Group Head */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Group Head
                  </label>
                  <input
                    type="text"
                    name="groupHead"
                    value={formData.groupHead}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-700 ${
                      errors.groupHead ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.groupHead && <p className="text-red-500 text-sm mt-1">{errors.groupHead}</p>}
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* FUP */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    FUP
                  </label>
                  <input
                    type="date"
                    name="fup"
                    value={formData.fup}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-700 ${
                      errors.fup ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.fup && <p className="text-red-500 text-sm mt-1">{errors.fup}</p>}
                </div>

                {/* Term */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Term
                  </label>
                  <input
                    type="text"
                    name="term"
                    value={formData.term}
                    onChange={handleInputChange}
                    placeholder="e.g., 20 Years"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-700"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-700 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
              </div>

              {/* Third Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Mode */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Mode:
                  </label>
                  <input
                    type="text"
                    name="mode"
                    value={formData.mode}
                    onChange={handleInputChange}
                    placeholder="e.g., Y, H, Q, M"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-700"
                  />
                </div>

                {/* Commencement Date */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Commencement Date:
                  </label>
                  <input
                    type="date"
                    name="commencementDate"
                    value={formData.commencementDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-700 ${
                      errors.commencementDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.commencementDate && <p className="text-red-500 text-sm mt-1">{errors.commencementDate}</p>}
                </div>

                {/* Sum Assured */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Sum Assured
                  </label>
                  <input
                    type="number"
                    name="sumAssured"
                    value={formData.sumAssured}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-700 ${
                      errors.sumAssured ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.sumAssured && <p className="text-red-500 text-sm mt-1">{errors.sumAssured}</p>}
                </div>
              </div>

              {/* Fourth Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Product */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Product
                  </label>
                  <input
                    type="text"
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    placeholder="e.g., Endowment Plan"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-700"
                  />
                </div>

                {/* Maturity Date */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Maturity Date
                  </label>
                  <input
                    type="date"
                    name="maturityDate"
                    value={formData.maturityDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-700 ${
                      errors.maturityDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.maturityDate && <p className="text-red-500 text-sm mt-1">{errors.maturityDate}</p>}
                </div>

                {/* Premium */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Premium
                  </label>
                  <input
                    type="number"
                    name="premium"
                    value={formData.premium}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-700 ${
                      errors.premium ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.premium && <p className="text-red-500 text-sm mt-1">{errors.premium}</p>}
                </div>
              </div>

              {/* Fifth Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Policy Holder */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Policy Holder
                  </label>
                  <input
                    type="text"
                    name="policyHolder"
                    value={formData.policyHolder}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-700 ${
                      errors.policyHolder ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.policyHolder && <p className="text-red-500 text-sm mt-1">{errors.policyHolder}</p>}
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">DOB</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-700"
                  />
                </div>

                {/* Policy Status (readonly computed) */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Status</label>
                  <input
                    type="text"
                    name="policyStatus"
                    value={
                      formData.maturityDate
                        ? (new Date(formData.maturityDate) > new Date() ? 'Active' : 'Matured')
                        : 'Active'
                    }
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-800"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-8 rounded-lg transition transform hover:scale-105 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div></div>
              <button
                onClick={handleCloseSuccess}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 animate-bounce">
                  <svg className="w-24 h-24 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <svg className="w-24 h-24 text-green-500 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>

            {/* Success Text */}
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">Success!</h3>
            <p className="text-center text-gray-600 mb-6">New policy created successfully.</p>

            {/* OK Button */}
            <button
              onClick={handleCloseSuccess}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

