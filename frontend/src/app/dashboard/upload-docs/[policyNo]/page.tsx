'use client';


import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiCall, SessionExpiredError } from '@/app/utils/api';
import { useSession } from '@/app/context/SessionContext';
import { Home, FileText, BarChart3, Calendar, Settings, LogOut, Menu, ChevronDown, Trash2, Plus, Download } from 'lucide-react';
import styles from './page.module.css';

export default function UploadDocsPage() {
  const router = useRouter();
  const params = useParams();
  const policyNo = params?.policyNo ? String(params.policyNo) : '';
  const { handleSessionExpiry } = useSession();

  // File size limit: 1MB (1048576 bytes)
  const MAX_FILE_SIZE = 1048576;

  const [policy, setPolicy] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ artifactId: string | number; fileName: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
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
          if (err instanceof SessionExpiredError) {
            console.log('Session expired, redirecting to login...');
            handleSessionExpiry();
          } else {
            console.warn('Policy fetch failed:', err);
            setPolicy(null);
          }
        }

        // Fetch documents from the list-artifacts endpoint
        try {
          const timestamp = new Date().getTime(); // Add timestamp to prevent caching
          const d = await apiCall(`/api/v1/policy/${policyNo}/list-artifacts?page=0&size=100&t=${timestamp}`, { method: 'GET' });
          console.debug('documents response:', d);
          console.debug('First document details:', d && (Array.isArray(d) ? d[0] : d.content?.[0]));
          if (Array.isArray(d)) setDocs(d);
          else if (d && Array.isArray(d.content)) setDocs(d.content);
        } catch (e) {
          // ignore, leave docs empty
          if (e instanceof SessionExpiredError) {
            console.log('Session expired, redirecting to login...');
            handleSessionExpiry();
          } else {
            console.warn('Documents fetch failed:', e);
            setDocs([]);
          }
        }
      } catch (err: any) {
        if (err instanceof SessionExpiredError) {
          console.log('Session expired, redirecting to login...');
          handleSessionExpiry();
        } else {
          setError(err?.message || 'Failed to load');
        }
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

  // Fetch documents fresh from API every time
  const fetchDocuments = async () => {
    try {
      const timestamp = new Date().getTime(); // Add timestamp to prevent caching
      const d = await apiCall(`/api/v1/policy/${policyNo}/list-artifacts?page=0&size=100&t=${timestamp}`, { method: 'GET' });
      console.debug('Fetched documents from API:', d);
      console.debug('First document structure:', d && (Array.isArray(d) ? d[0] : d.content?.[0]));
      if (Array.isArray(d)) {
        setDocs(d);
      } else if (d && Array.isArray(d.content)) {
        setDocs(d.content);
      } else {
        setDocs([]);
      }
    } catch (e) {
      if (e instanceof SessionExpiredError) {
        console.log('Session expired, redirecting to login...');
        handleSessionExpiry();
      } else {
        console.warn('Failed to fetch documents:', e);
        setDocs([]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validationError = validateFiles(files);
      
      if (validationError) {
        setUploadError(validationError);
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setUploadError('');
        setSelectedFiles(files);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      const validationError = validateFiles(files);
      
      if (validationError) {
        setUploadError(validationError);
        setSelectedFiles([]);
      } else {
        setUploadError('');
        setSelectedFiles(files);
      }
    }
  };

  const validateFiles = (files: File[]): string => {
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(1);
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        return `File "${file.name}" (${fileSizeMB}MB) exceeds the maximum allowed size of ${maxSizeMB}MB`;
      }
    }
    return '';
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadError('Please select at least one file to upload');
      return;
    }

    // Validate file sizes before upload
    const validationError = validateFiles(selectedFiles);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      // Upload each file individually
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);

        // Make the POST request with policyNumber in the URL path
        const response = await apiCall(`/api/v1/policy/${policyNo}/upload-artifacts`, {
          method: 'POST',
          body: formData,
        });

        console.log(`Upload response for ${file.name}:`, response);
      }

      setUploadSuccess('Files uploaded successfully!');
      
      // Clear selected files
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Fetch fresh documents from API after upload
      await fetchDocuments();

      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (err: any) {
      if (err instanceof SessionExpiredError) {
        console.log('Session expired, redirecting to login...');
        handleSessionExpiry();
      } else {
        console.error('Upload error:', err);
        setUploadError(err?.message || 'Failed to upload files');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (idx: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== idx));
  };

  const handleDownloadDocument = async (artifactId: string | number, fileName: string) => {
    try {
      console.log('Downloading document:', { artifactId, fileName, policyNo });
      const response = await fetch(`http://localhost:8081/api/v1/policy/${policyNo}/download-artifacts/${artifactId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      console.log('Download response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download error response:', errorText);
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download error:', err);
      alert('Failed to download document: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleDeleteDocument = (artifactId: string | number, fileName: string) => {
    setDeleteConfirm({ artifactId, fileName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    const { artifactId, fileName } = deleteConfirm;
    setDeleting(true);

    try {
      console.log('Deleting document:', { artifactId, fileName, policyNo });
      await apiCall(`/api/v1/policy/${policyNo}/delete-artifact?artifactId=${artifactId}`, {
        method: 'DELETE',
      });

      console.log('Document deleted successfully');
      
      // Refresh the documents list
      await fetchDocuments();
      
      setDeleteConfirm(null);
    } catch (err: any) {
      if (err instanceof SessionExpiredError) {
        console.log('Session expired, redirecting to login...');
        handleSessionExpiry();
      } else {
        console.error('Delete error:', err);
        alert('Failed to delete document: ' + (err?.message || 'Unknown error'));
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.root}>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? 'w-56' : 'w-20'}`}>
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
      <div className={styles.main}>
        {/* Top Header */}
        <div className={styles.header}>
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
        <div className={`${styles.pageContent} bg-blue-50`}>
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button onClick={handleBack} className="px-3 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100">Back</button>
            </div>
            <div className={styles.card}>
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
            <div className={styles.card}>
              <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
              <div
                className={styles.dropzone}
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
                <div className={styles.selectedFiles}>
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className={styles.fileRow}>
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
              {uploadError && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {uploadError}
                </div>
              )}
              {uploadSuccess && (
                <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {uploadSuccess}
                </div>
              )}
              <div className={styles.uploadButtons}>
                <button onClick={() => setSelectedFiles([])} disabled={uploading} className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
                <button onClick={handleUpload} disabled={uploading || selectedFiles.length === 0} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed">
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </button>
              </div>
            </div>
            <div className={styles.docsCard}>
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
                              <button onClick={() => handleDownloadDocument(d.id, d.fileName || d.name || 'document')} className="text-blue-600 hover:text-blue-800" title="Download"><Download size={18} /></button>
                              <button onClick={() => handleDeleteDocument(d.id, d.fileName || d.name || 'document')} className="text-red-500 hover:text-red-700" title="Delete"><Trash2 size={18} /></button>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 pointer-events-auto border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Delete Document</h3>
            </div>
            <p className="text-gray-700 mb-2 leading-relaxed">
              Are you sure you want to delete this document?
            </p>
            <p className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 font-semibold break-words">
              {deleteConfirm.fileName}
            </p>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
