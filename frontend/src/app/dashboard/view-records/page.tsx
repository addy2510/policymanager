"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  LogOut,
  Home,
  FileText,
  BarChart3,
  Calendar,
  Settings,
  Search,
} from "lucide-react";
import { apiCall } from "@/app/utils/api";

interface PolicyRecord {
  id?: string;
  policyNo?: string;
  policyNumber?: string;
  customerName?: string;
  personName?: string;
  groupCode?: string;
  policyType?: string;
  startDate?: string;
  maturityDate?: string;
  status?: string;
  fup?: string;
  premium?: number;
  term?: string;
  address?: string;
  mode?: string;
  product?: string;
  commencementDate?: string;
  sumAssured?: number;
  groupHead?: string;
  dob?: string;
  [key: string]: any;
}

export default function ViewRecords() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allRecords, setAllRecords] = useState<PolicyRecord[]>([]);

  const [records, setRecords] = useState<PolicyRecord[]>([]);
  const [filterPolicyNo, setFilterPolicyNo] = useState("");
  const [filterGroupCode, setFilterGroupCode] = useState("");
  const [filterCustomerName, setFilterCustomerName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyRecord | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch all records on component mount
  useEffect(() => {
    const fetchAllRecords = async () => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();

      params.append("page", "0");
      params.append("size", "2000");

      try {
        const queryString = params.toString();
        const result = await apiCall("/api/v1/policy/all?" + queryString, {
          method: "GET"
        });

        console.log("Fetched all records:", result);

        // Map API response to PolicyRecord interface
        const mappedRecords = (result.content || result || []).map((record: any) => ({
          id: record.id || `${record.policyNumber}`,
          policyNo: record.policyNumber || record.policyNo || "",
          policyNumber: record.policyNumber,
          customerName: record.personName || record.customerName || "",
          personName: record.personName,
          groupCode: record.groupCode || "",
          policyType: record.policyType || "",
          startDate: record.startDate || "",
          maturityDate: record.maturityDate || "",
          status: record.status || "",
          fup: record.fup || "",
          premium: record.premium || 0,
          term: record.term || "",
          address: record.address || "",
          mode: record.mode || "",
          product: record.product || "",
          commencementDate: record.commencementDate || "",
          sumAssured: record.sumAssured || 0,
          groupHead: record.groupHead || "",
          dob: record.dob || "",
          ...record,
        }));

        setAllRecords(mappedRecords);
        setRecords(mappedRecords);
      } catch (err) {
        console.error("Error fetching all records:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch records"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllRecords();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    router.push("/");
  };

  const handleFilterRecords = async () => {
    setError("");
    setLoading(true);

    try {
      // Build query parameters with non-empty filters
      const params = new URLSearchParams();

      if (filterPolicyNo.trim()) {
        params.append("policyNumber", filterPolicyNo.trim());
      }
      if (filterCustomerName.trim()) {
        params.append("personName", filterCustomerName.trim());
      }
      if (filterGroupCode) {
        params.append("groupCode", filterGroupCode);
      }

      // Add pagination parameters to get all records
      params.append("page", "0");
      params.append("size", "1000"); // Large size to get all records at once

      const queryString = params.toString();
      const endpoint = `/api/v1/policy/search${queryString ? "?" + queryString : ""}`;

      console.log("Sending search request to:", endpoint);
      console.log(
        "Token from localStorage:",
        localStorage.getItem("authToken"),
      );

      // Call the API
      const result = await apiCall(endpoint, {
        method: "GET",
      });

      console.log("API response:", result);

      // Map API response to PolicyRecord interface
      const mappedRecords = (result.content || []).map((record: any) => ({
        id: record.id || `${record.policyNumber}`,
        policyNo: record.policyNumber || record.policyNo || "",
        policyNumber: record.policyNumber,
        customerName: record.personName || record.customerName || "",
        personName: record.personName,
        groupCode: record.groupCode || "",
        policyType: record.policyType || "",
        startDate: record.startDate || "",
        maturityDate: record.maturityDate || "",
        status: record.status || "",
        fup: record.fup || "",
        premium: record.premium || 0,
        term: record.term || "",
        address: record.address || "",
        mode: record.mode || "",
        product: record.product || "",
        commencementDate: record.commencementDate || "",
        sumAssured: record.sumAssured || 0,
        groupHead: record.groupHead || "",
        dob: record.dob || "",
        ...record, // Include all other fields
      }));

      // Set the filtered records from API response
      setRecords(mappedRecords);
      setCurrentPage(1);
    } catch (err) {
      console.error("Search error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to search policies",
      );
      // Fall back to local filtering if API fails
      let filtered = allRecords;

      if (filterPolicyNo.trim()) {
        filtered = filtered.filter((record) =>
          (record.policyNo || record.policyNumber || '')
            .toString()
            .toLowerCase()
            .includes(filterPolicyNo.toLowerCase()),
        );
      }

      if (filterGroupCode) {
        filtered = filtered.filter(
          (record) => (record.groupCode || '') === filterGroupCode,
        );
      }

      if (filterCustomerName.trim()) {
        filtered = filtered.filter((record) =>
          (record.customerName || record.personName || '')
            .toLowerCase()
            .includes(filterCustomerName.toLowerCase()),
        );
      }

      setRecords(filtered);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = async () => {
    setFilterPolicyNo("");
    setFilterGroupCode("");
    setFilterCustomerName("");
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.append("page", "0");
      params.append("size", "2000");

      const queryString = params.toString();
      const result = await apiCall("/api/v1/policy/all?" + queryString, {
        method: "GET"
      });

      const mappedRecords = (result.content || result || []).map((record: any) => ({
        id: record.id || `${record.policyNumber}`,
        policyNo: record.policyNumber || record.policyNo || "",
        policyNumber: record.policyNumber,
        customerName: record.personName || record.customerName || "",
        personName: record.personName,
        groupCode: record.groupCode || "",
        policyType: record.policyType || "",
        startDate: record.startDate || "",
        maturityDate: record.maturityDate || "",
        status: record.status || "",
        fup: record.fup || "",
        premium: record.premium || 0,
        term: record.term || "",
        address: record.address || "",
        mode: record.mode || "",
        product: record.product || "",
        commencementDate: record.commencementDate || "",
        sumAssured: record.sumAssured || 0,
        groupHead: record.groupHead || "",
        dob: record.dob || "",
        ...record,
      }));

      setAllRecords(mappedRecords);
      setRecords(mappedRecords);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching all records:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch records"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500 text-white";
      case "Matured":
        return "bg-amber-500 text-white";
      case "Lapsed":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Calculate statistics
  const totalPolicies = records.length;
  const activePolicies = records.filter((r) => r.status === "ACTIVE").length;
  const maturedPolicies = records.filter((r) => r.status === "MATURED").length;
  const lapsedPolicies = records.filter((r) => r.status === "LAPSED").length;

  // Pagination
  const totalPages = Math.ceil(records.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = records.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-slate-700 text-white transition-all duration-300 ${sidebarOpen ? "w-48" : "w-20"} flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-600">
          <div className="bg-blue-500 p-2 rounded">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 1C6.48 1 2 4.58 2 9v10c0 4.42 4.48 8 10 8s10-3.58 10-8V9c0-4.42-4.48-8-10-8zm0 2c4.41 0 8 2.69 8 6v10c0 3.31-3.59 6-8 6s-8-2.69-8-6V9c0-3.31 3.59-6 8-6zm3.5 9c.83 0 1.5.67 1.5 1.5S16.33 15 15.5 15 14 14.33 14 13.5s.67-1.5 1.5-1.5zm-7 0c.83 0 1.5.67 1.5 1.5S9.33 15 8.5 15 7 14.33 7 13.5 7.67 12 8.5 12z" />
            </svg>
          </div>
          {sidebarOpen && <span className="font-bold text-lg">Menu</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div
            onClick={() => router.push('/dashboard')}
            className={pathname === '/dashboard' ? 'flex items-center gap-3 px-4 py-3 bg-blue-600 rounded' : 'flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer'}
          >
            <Home size={20} />
            {sidebarOpen && <span>Dashboard</span>}
          </div>
          <div
            onClick={() => router.push('/dashboard/new-policy')}
            className={pathname === '/dashboard/new-policy' ? 'flex items-center gap-3 px-4 py-3 bg-blue-600 rounded' : 'flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer'}
          >
            <FileText size={20} />
            {sidebarOpen && <span>Policies</span>}
          </div>
          <div
            onClick={() => router.push('/dashboard/view-records')}
            className={pathname === '/dashboard/view-records' ? 'flex items-center gap-3 px-4 py-3 bg-blue-600 rounded' : 'flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer'}
          >
            <BarChart3 size={20} />
            {sidebarOpen && <span>Records</span>}
          </div>
          <div
            onClick={() => router.push('/dashboard/maturity-list')}
            className={pathname === '/dashboard/maturity-list' ? 'flex items-center gap-3 px-4 py-3 bg-blue-600 rounded' : 'flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer'}
          >
            <Calendar size={20} />
            {sidebarOpen && <span>Maturity List</span>}
          </div>
          <div
            onClick={() => router.push('/dashboard/update-policy')}
            className={pathname === '/dashboard/update-policy' ? 'flex items-center gap-3 px-4 py-3 bg-blue-600 rounded' : 'flex items-center gap-3 px-4 py-3 hover:bg-slate-600 rounded cursor-pointer'}
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
            <h1 className="text-2xl font-bold text-gray-800">
              View Policy Records
            </h1>
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
            <p className="text-gray-600 mb-6">
              View all records of policies using paginate data
            </p>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-700 p-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {/* Filter Section */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-48">
                <label className="block text-gray-700 font-semibold mb-2">
                  Policy No
                </label>
                <input
                  type="text"
                  value={filterPolicyNo}
                  onChange={(e) => setFilterPolicyNo(e.target.value)}
                  placeholder="Search policy number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              <div className="flex-1 min-w-48">
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Customer Name
                </label>
                <input
                  type="text"
                  value={filterCustomerName}
                  onChange={(e) => setFilterCustomerName(e.target.value)}
                  placeholder="Search customer name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              <div className="flex-1 min-w-48">
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                  Group Code
                </label>
                <input
                  type="text"
                  value={filterGroupCode}
                  onChange={(e) => setFilterGroupCode(e.target.value)}
                  placeholder="Search group code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              <button
                onClick={handleFilterRecords}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-6 rounded-lg transition disabled:cursor-not-allowed"
              >
                {loading ? "Searching..." : "Filter Records"}
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
                  <p className="text-lg font-bold text-blue-600">
                    {totalPolicies}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <div>
                  <p className="text-gray-600 text-sm">Active Policies</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {activePolicies}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div>
                  <p className="text-gray-600 text-sm">Matured Policies</p>
                  <p className="text-lg font-bold text-amber-600">
                    {maturedPolicies}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div>
                  <p className="text-gray-600 text-sm">Lapsed Policies</p>
                  <p className="text-lg font-bold text-red-600">
                    {lapsedPolicies}
                  </p>
                </div>
              </div>
            </div>

            {/* Table Info */}
            <div className="flex items-center gap-4 mb-4">
              <p className="text-gray-700 font-semibold">
                Policies: {totalPolicies}
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Policy No
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Customer Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Group Code
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Policy Type
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Start Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">
                        {record.policyNo || record.policyNumber || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {record.customerName || record.personName || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {record.groupCode || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {record.policyType || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {record.startDate || record.maturityDate || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status || "Active")}`}
                        >
                          {record.status || "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setSelectedPolicy(record);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-gray-600">
                Showing {records.length === 0 ? 0 : startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, records.length)} of{" "}
                {records.length} entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &laquo;
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <span className="px-2 py-1 text-gray-600">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded font-semibold ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &raquo;
                </button>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="ml-4 px-3 py-1 border border-gray-300 rounded"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* Modal */}
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-screen overflow-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-800">Policy Details</h2>
            </div>

            {/* Modal Content */}
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Policy No</p>
                <p className="text-gray-800 text-lg font-bold">
                  {selectedPolicy.policyNo || selectedPolicy.policyNumber || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Customer Name</p>
                <p className="text-gray-800 text-lg">
                  {selectedPolicy.customerName || selectedPolicy.personName || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Group Code</p>
                <p className="text-gray-800 text-lg">
                  {selectedPolicy.groupCode || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Group Head</p>
                <p className="text-gray-800 text-lg">
                  {selectedPolicy.groupHead || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Policy Type</p>
                <p className="text-gray-800 text-lg">
                  {selectedPolicy.policyType || selectedPolicy.product || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Product</p>
                <p className="text-gray-800 text-lg">
                  {selectedPolicy.product || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Commencement Date</p>
                <p className="text-gray-800 text-lg">
                  {selectedPolicy.commencementDate || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Start Date</p>
                <p className="text-gray-800 text-lg">
                  {selectedPolicy.startDate || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Maturity Date</p>
                <p className="text-gray-800 text-lg">
                  {selectedPolicy.maturityDate || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Term</p>
                <p className="text-gray-800 text-lg">
                  {selectedPolicy.term || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Sum Assured</p>
                <p className="text-gray-800 text-lg">
                  {selectedPolicy.sumAssured ? `₹${selectedPolicy.sumAssured.toFixed(2)}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Premium</p>
                <p className="text-gray-800 text-lg">
                  {selectedPolicy.premium ? `₹${selectedPolicy.premium.toFixed(2)}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Mode</p>
                <p className="text-gray-800 text-lg">
                  {selectedPolicy.mode || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">FUP</p>
                <p className="text-gray-800 text-lg">
                  {selectedPolicy.fup || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Date of Birth</p>
                <p className="text-gray-800 text-lg">
                  {selectedPolicy.dob || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Status</p>
                <p className="text-gray-800 text-lg">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedPolicy.status || 'Active')}`}>
                    {selectedPolicy.status || 'Active'}
                  </span>
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600 text-sm font-semibold">Address</p>
                <p className="text-gray-800 text-lg">
                  {selectedPolicy.address || 'N/A'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPolicy(null);
                }}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
