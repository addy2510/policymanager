'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, Home, FileText, BarChart3, Calendar, Settings, Search, ChevronDown } from 'lucide-react';

interface User {
  username: string;
  rememberMe: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

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
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded">
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
          {/* Welcome Section */}
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Welcome to Insurance Management System!</h1>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* New Policy Card */}
            <button
              onClick={() => router.push('/dashboard/new-policy')}
              className="bg-blue-500 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">New Policy</h2>
                  <p className="text-blue-100">Create a New Policy</p>
                </div>
                <div className="bg-blue-600 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Update Policy Card */}
            <button
              onClick={() => router.push('/dashboard/update-policy')}
              className="bg-yellow-300 rounded-lg p-6 text-gray-800 shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Update Policy</h2>
                  <p className="text-gray-600">Modify Existing Policy</p>
                </div>
                <div className="bg-gray-200 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
                    <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </div>
              </div>
            </button>

            {/* View Policy Records Card */}
            <button
              onClick={() => router.push('/dashboard/view-records')}
              className="bg-blue-500 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">View Policy Records</h2>
                  <p className="text-blue-100">Search & Filter Records</p>
                </div>
                <div className="bg-blue-600 p-3 rounded-lg flex items-center justify-center">
                  <div className="relative">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>

            {/* Maturity List Card */}
            <button
              onClick={() => router.push('/dashboard/maturity-list')}
              className="bg-emerald-400 rounded-lg p-6 text-gray-800 shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Maturity List</h2>
                  <p className="text-gray-600">View Maturing Policies</p>
                </div>
                <div className="bg-emerald-500 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          {/* Statistics Section */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-around">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-700">Total Policies: <span className="font-bold text-blue-600">1,250</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-700">Active Policies: <span className="font-bold text-green-600">980</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-gray-700">Matured Policies: <span className="font-bold text-orange-600">150</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
