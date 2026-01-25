import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import PSASLayout from "../../components/psas/PSASLayout";
import ClubOfficerLayout from "../../components/club-officers/ClubOfficerLayout";
import { useAuth } from "../../contexts/useAuth";
import api from "../../api";
import toast from "react-hot-toast";

// API endpoints constants
const API_ENDPOINTS = {
  SCHOOL_ADMINS: "/api/reports/senior-management",
  REPORT_SHARE: (reportId) => `/api/reports/${reportId}/share`,
};

const ReportSharingPage = () => {
  console.log("🚀 ReportSharingPage component is rendering!");
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [selected, setSelected] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Load school admins from API
  useEffect(() => {
    let mounted = true;

    const fetchSchoolAdmins = async () => {
      try {
        setLoadingUsers(true);
        const res = await api.get(API_ENDPOINTS.SCHOOL_ADMINS, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (mounted) {
          // api.get() returns JSON directly (not wrapped in .data)
          const usersArray = res.users || [];

          // Map the users, preserving actual department/position values from backend
          const fetchedUsers = usersArray.map((u) => ({
            id: u._id || u.id,
            name: u.name || u.email,
            email: u.email,
            department: u.department, // Use actual value from backend
            position: u.position, // Use actual value from backend
            role: u.role,
          }));

          setUsers(fetchedUsers);
        }
      } catch (error) {
        console.error("Error fetching school admins:", error);
        if (mounted) {
          toast.error("Unable to load senior management");
        }
      } finally {
        if (mounted) {
          setLoadingUsers(false);
        }
      }
    };

    fetchSchoolAdmins();

    return () => {
      mounted = false;
    };
  }, [token]);

  // Get reportId/eventId from location state or URL params
  const reportId =
    location.state?.reportId ||
    location.state?.eventId ||
    new URLSearchParams(location.search).get("reportId");

  // Get report title for email notification
  const reportTitle =
    location.state?.reportTitle ||
    location.state?.eventName ||
    "Evaluation Report";

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allFilteredIds = filteredUsers.map((u) => u.id);
      setSelected(allFilteredIds);
    } else {
      setSelected([]);
    }
  };

  // Validate rows per page selection
  const validateRowsPerPage = (value) => {
    const numValue = Number(value);
    return !isNaN(numValue) && numValue > 0 && numValue <= 100;
  };

  const handleDone = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one senior management member");
      return;
    }

    if (!reportId) {
      toast.error("Report ID not found");
      navigate(-1);
      return;
    }

    // Get full user details for selected IDs
    const selectedUsers = users.filter((u) => selected.includes(u.id));

    try {
      setIsSharing(true);

      // Call API to share report
      await api.post(
        API_ENDPOINTS.REPORT_SHARE(reportId),
        {
          schoolAdmins: selectedUsers.map((u) => ({
            personnelId: u.id,
            name: u.name,
            email: u.email,
            department: u.department,
            position: u.position,
          })),
          reportTitle, // Include report title for email notification
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(
        `Report shared with ${selected.length} senior management member(s)`,
      );
      navigate(-1);
    } catch (error) {
      console.error("Error sharing report:", error);
      toast.error(error.response?.data?.message || "Failed to share report");
    } finally {
      setIsSharing(false);
    }
  };

  const departments = useMemo(() => {
    return [...new Set(users.map((u) => u.department).filter(Boolean))].sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !searchQuery ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.position &&
          user.position.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDepartment =
        !departmentFilter || user.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [users, searchQuery, departmentFilter]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const result = filteredUsers.slice(startIndex, endIndex);
    console.log("Paginated Users:", result); // Debug: Log paginated data
    console.log("Loading state:", loadingUsers); // Debug: Log loading state
    console.log("Filtered count:", filteredUsers.length); // Debug: Log filtered count
    return result;
  }, [filteredUsers, currentPage, rowsPerPage, loadingUsers]);

  // Note: Edit and delete functionality removed - users should be managed from User Management page

  const Layout = user?.role === "club-officer" ? ClubOfficerLayout : PSASLayout;

  return (
    <Layout>
      <div className="p-4 sm:p-6 md:p-8 bg-gray-100 min-h-full">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
            disabled={isSharing}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <button
            onClick={handleDone}
            disabled={isSharing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSharing
              ? "Sharing..."
              : selected.length > 0
                ? `Done (${selected.length} selected)`
                : "Done"}
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or position"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setDepartmentFilter("")}
                  className="w-full md:w-auto px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Personnel Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid items-center p-3 bg-gray-200 border-b border-gray-300 grid-cols-[auto_1.5fr_2.5fr_2fr_2fr] gap-x-4">
            <input
              type="checkbox"
              checked={
                selected.length > 0 && selected.length === filteredUsers.length
              }
              onChange={handleSelectAll}
              className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <h2 className="text-lg font-semibold text-gray-700">Full Name</h2>
            <h2 className="text-lg font-semibold text-gray-700">Email</h2>
            <h2 className="text-lg font-semibold text-gray-700">Department</h2>
            <h2 className="text-lg font-semibold text-gray-700">Position</h2>
          </div>

          {/* Table Body */}
          <div>
            {loadingUsers ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : paginatedUsers.length > 0 ? (
              paginatedUsers.map((person) => {
                const personId = person.id;
                return (
                  <div
                    key={personId}
                    onClick={() => handleSelect(personId)}
                    className="grid items-center p-3 border-t border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer
                              grid-cols-[auto_1fr] md:grid-cols-[auto_1.5fr_2.5fr_2fr_2fr] gap-x-4 gap-y-1"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(personId)}
                      onChange={() => handleSelect(personId)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 mt-1 md:mt-0"
                    />

                    {/* Mobile View */}
                    <div className="md:hidden flex flex-col">
                      <span className="font-medium text-gray-800">
                        {person.name || "No name"}
                      </span>
                      <span className="text-sm text-gray-600 break-all">
                        Email: {person.email}
                      </span>
                      <span className="text-sm text-gray-600">
                        Department: {person.department || "N/A"}
                      </span>
                      <span className="text-sm text-gray-600">
                        Position: {person.position || "N/A"}
                      </span>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block">
                      <span className="font-medium text-gray-800">
                        {person.name || "No name"}
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <span className="text-gray-600 break-all">
                        {person.email}
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <span className="text-gray-600">
                        {person.department || "N/A"}
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <span className="text-gray-600">
                        {person.position || "N/A"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500">
                No users match your search criteria.
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-gray-700">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                const value = e.target.value;
                if (validateRowsPerPage(value)) {
                  setRowsPerPage(Number(value));
                  setCurrentPage(1);
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-gray-700">
              out of {filteredUsers.length} rows
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-blue-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <ChevronLeft className="w-4 h-4 -ml-2" />
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-blue-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentPage === pageNum
                          ? "bg-blue-800 text-white"
                          : "bg-gray-200 text-blue-800 hover:bg-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 3 ||
                  pageNum === currentPage + 3
                ) {
                  return (
                    <span
                      key={pageNum}
                      className="w-8 h-8 flex items-center justify-center text-blue-800"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-blue-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-blue-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
              <ChevronRight className="w-4 h-4 -ml-2" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportSharingPage;
