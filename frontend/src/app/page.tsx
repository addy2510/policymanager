'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockIcon, UserIcon } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Store user info in localStorage for the session
    localStorage.setItem('user', JSON.stringify({ username, rememberMe }));
    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 via-blue-500 to-blue-400 flex items-center justify-center p-4">
      {/* Background cityscape effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-20">
        <svg viewBox="0 0 1200 300" preserveAspectRatio="none" className="w-full h-full">
          <rect x="50" y="150" width="40" height="150" fill="currentColor" />
          <rect x="120" y="120" width="50" height="180" fill="currentColor" />
          <rect x="200" y="100" width="45" height="200" fill="currentColor" />
          <rect x="280" y="140" width="35" height="160" fill="currentColor" />
          <rect x="350" y="110" width="55" height="190" fill="currentColor" />
          <rect x="450" y="130" width="40" height="170" fill="currentColor" />
          <rect x="520" y="90" width="60" height="210" fill="currentColor" />
          <rect x="620" y="120" width="50" height="180" fill="currentColor" />
          <rect x="700" y="100" width="45" height="200" fill="currentColor" />
          <rect x="780" y="140" width="35" height="160" fill="currentColor" />
          <rect x="850" y="110" width="55" height="190" fill="currentColor" />
          <rect x="950" y="130" width="40" height="170" fill="currentColor" />
        </svg>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header with Icon */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1C6.48 1 2 4.58 2 9v10c0 4.42 4.48 8 10 8s10-3.58 10-8V9c0-4.42-4.48-8-10-8zm0 2c4.41 0 8 2.69 8 6v10c0 3.31-3.59 6-8 6s-8-2.69-8-6V9c0-3.31 3.59-6 8-6zm3.5 9c.83 0 1.5.67 1.5 1.5S16.33 15 15.5 15 14 14.33 14 13.5s.67-1.5 1.5-1.5zm-7 0c.83 0 1.5.67 1.5 1.5S9.33 15 8.5 15 7 14.33 7 13.5 7.67 12 8.5 12z" />
              </svg>
            </div>
            <h1 className="text-white text-2xl font-bold">Insurance Management System</h1>
          </div>
          <h2 className="text-white text-4xl font-bold">Welcome Back!</h2>
        </div>

        {/* Login Form Card */}
        <div className="bg-blue-300/60 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600">
                <UserIcon size={20} />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white rounded-xl pl-12 pr-4 py-3 text-gray-700 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600">
                <LockIcon size={20} />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white rounded-xl pl-12 pr-4 py-3 text-gray-700 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="remember" className="ml-3 text-white font-medium cursor-pointer">
                Remember Me
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition transform hover:scale-105 mt-6"
            >
              Login
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <a href="#" className="text-white font-medium hover:underline">
                Forgot Password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
