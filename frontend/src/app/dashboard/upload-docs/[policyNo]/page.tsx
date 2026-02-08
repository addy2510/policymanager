'use client';


import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiCall } from '@/app/utils/api';
import { Home, FileText, BarChart3, Calendar, Settings, LogOut, Menu, ChevronDown, Trash2, Plus } from 'lucide-react';

export default function UploadDocsPage() {
  const router = useRouter();
  const params = useParams();
  const policyNo = params?.policyNo ? String(params.policyNo) : '';

  const [policy, setPolicy] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  useEffect(() => {
    const fetchPolicyAndDocs = async () => {
      if (!policyNo) {
        console.debug('policyNo is empty, skipping fetch');
        return;
      }
      setLoading(true);
      console.debug('Fetching policy for policyNo:', policyNo, 'type:', typeof policyNo);
      try {
        // backend does not expose GET /api/v1/policy/{policyNo}
        // use search endpoint and pick first matching policy
        try {
          const endpoint = `/api/v1/policy/search?policyNumber=${encodeURIComponent(policyNo)}&page=0&size=1`;
          console.debug('Calling endpoint:', endpoint);
          const searchRes = await apiCall(endpoint, { method: 'GET' });
          console.debug('Raw policy search response:', JSON.stringify(searchRes, null, 2));
          console.debug('Response type:', typeof searchRes, 'is array:', Array.isArray(searchRes));
          console.debug('Response keys:', searchRes ? Object.keys(searchRes) : 'null');
          
          // search returns a Page<PolicyResponse> with content array
          if (searchRes && Array.isArray(searchRes.content) && searchRes.content.length > 0) {
            console.debug('Found policy in content array:', searchRes.content[0]);
            setPolicy(searchRes.content[0]);
          } else if (Array.isArray(searchRes)) {
            // fallback if API returns array
            console.debug('Response is array, using first element:', searchRes[0]);
            setPolicy(searchRes[0] || null);
          } else if (searchRes && typeof searchRes === 'object' && Object.keys(searchRes).length > 0) {
            // sometimes API may return single object
            console.debug('Response is object, using entire object:', searchRes);
            setPolicy(searchRes as any);
          } else {
            console.debug('No policy found in response');
            setPolicy(null);
          }
        } catch (err) {
          console.warn('Policy fetch failed:', err);
          setPolicy(null);
        }

        // documents endpoint not implemented on backend; keep docs empty or adapt if available
        try {
          const d = await apiCall(`/api/v1/policy/${policyNo}/documents`, { method: 'GET' });
          console.debug('documents response:', d);
          if (Array.isArray(d)) setDocs(d);
          else if (d && Array.isArray(d.content)) setDocs(d.content);
        } catch (e) {
          // ignore, leave docs empty
          console.warn('Documents fetch failed:', e);
          setDocs([]);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchPolicyAndDocs();
  }, [policyNo]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleSidebarNav = (path: string) => router.push(path);
  const handleBack = () => router.push('/dashboard/view-records');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleUpload = () => {
    alert('Upload not implemented in this demo');
  };

  const handleRemoveFile = (idx: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-slate-700 text-white transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-20'} flex flex-col`}>
        <div className="flex items-center gap-3 p-4 border-b border-slate-600">
          <div className="bg-blue-500 p-2 rounded">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1C6.48 1 2 4.58 2 9v10c0 4.42 4.48 8 10 8s10-3.58 10-8V9c0-4.42-4.48-8-10-8zm0 2c4.41 0 8 2.69 8 6v10c0 3.31-3.59 6-8 6s-8-2.69-8-6V9c0-3.31 3.59-6 8-6zm3.5 9c.83 0 1.5.67 1.5 1.5S16.33 15 15.5 15 14 14.33 14 13.5s.67-1.5 1.5-1.5zm-7 0c.83 0 1.5.67 1.5 1.5S9.33 15 8.5 15 7 14.33 7 13.5 7.67 12 8.5 12z" />
            </svg>
          </div>
          {sidebarOpen && <span className="font-bold text-lg">Menu</span>}
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div onClick={() => handleSidebarNav('/dashboard')} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer">
            <Home size={20} />{sidebarOpen && <span>Dashboard</span>}
          </div>
          <div onClick={() => handleSidebarNav('/dashboard/new-policy')} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer">
            <FileText size={20} />{sidebarOpen && <span>Policies</span>}
          </div>
          <div onClick={() => handleSidebarNav('/dashboard/view-records')} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer">
            <BarChart3 size={20} />{sidebarOpen && <span>Records</span>}
          </div>
          <div onClick={() => handleSidebarNav('/dashboard/maturity-list')} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer">
            <Calendar size={20} />{sidebarOpen && <span>Maturity List</span>}
          </div>
          <div onClick={() => handleSidebarNav('/dashboard/update-policy')} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer">
            <Settings size={20} />{sidebarOpen && <span>Update</span>}
          </div>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full hover:bg-slate-600 rounded border-t border-slate-600">
          <LogOut size={20} />{sidebarOpen && <span>Logout</span>}
        </button>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-gray-900"><Menu size={24} /></button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt={user?.username || 'User'} className="w-8 h-8 rounded-full" />
              <span className="font-semibold text-gray-700">{user?.username || 'User'}</span>
              <ChevronDown size={18} className="text-gray-500" />
            </div>
          </div>
        </div>
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 bg-blue-50">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button onClick={handleBack} className="px-3 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100">Back</button>
            </div>
            <div className="bg-white rounded-lg shadow p-6 mb-6 text-black">
              <h1 className="text-2xl font-bold mb-4">Upload Documents for Policy <span className="text-blue-700">#{policyNo}</span></h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div><span className="font-semibold text-gray-700">Policy No:</span> {policy?.policyNumber ?? policyNo}</div>
                <div><span className="font-semibold text-gray-700">Customer Name:</span> {(
                  policy?.personName || policy?.customerName || policy?.name || policy?.person_name || 'N/A'
                )}</div>
                <div><span className="font-semibold text-gray-700">Group Code:</span> {(policy?.groupCode || policy?.group_code || 'N/A')}</div>
                <div><span className="font-semibold text-gray-700">Policy Type:</span> {(policy?.product || policy?.policyType || policy?.policy_type || 'N/A')}</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 mb-6 text-black">
              <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
              <div
                className="border-2 border-dashed border-blue-400 rounded-lg p-8 flex flex-col items-center justify-center bg-blue-50 cursor-pointer hover:bg-blue-100 transition"
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-blue-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-4 4m4-4l4 4M20 16.5V19a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.5" />
                  </svg>
                  <span className="text-blue-700 font-medium">Drag & drop your files here <span className="text-gray-500 font-normal">OR</span> <span className="underline text-blue-600 cursor-pointer">Browse</span></span>
                  <span className="text-xs text-gray-500 mt-1">.pdf, .png, .jpg - Maximum file size to 5 MB</span>
                </div>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </div>
              {/* Selected files preview */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 border rounded-lg bg-gray-50">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-blue-500" />
                        <span className="font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                      <button onClick={() => handleRemoveFile(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setSelectedFiles([])} className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button onClick={handleUpload} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Upload Files</button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-black">
              <h3 className="font-semibold mb-4">Existing Documents</h3>
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="px-4 py-2 text-left font-semibold">File Name</th>
                        <th className="px-4 py-2 text-left font-semibold">File Type</th>
                        <th className="px-4 py-2 text-left font-semibold">Size</th>
                        <th className="px-4 py-2 text-left font-semibold">Uploaded At</th>
                        <th className="px-4 py-2 text-left font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-black py-4">No documents found for this policy.</td>
                        </tr>
                      ) : (
                        docs.map((d, i) => (
                          <tr key={i} className="border-b last:border-b-0">
                            <td className="px-4 py-2">{d.fileName || d.name || 'Document'}</td>
                            <td className="px-4 py-2">{d.fileType || d.type || ''}</td>
                            <td className="px-4 py-2">{d.size ? `${(d.size / (1024 * 1024)).toFixed(2)} MB` : ''}</td>
                            <td className="px-4 py-2">{d.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : ''}</td>
                            <td className="px-4 py-2 flex gap-2">
                              <a href={d.url || '#'} target="_blank" rel="noreferrer" className="text-blue-600"><Plus size={18} /></a>
                              <button className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
