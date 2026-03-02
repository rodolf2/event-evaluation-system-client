import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  Users,
  ChevronLeft,
  ChevronRight,
  CircleUser,
  Ban,
  UserCheck,
  X,
  UserPlus,
  Mail,
  Check,
  Pencil,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/useAuth";

const FILTER_OPTIONS = [
  { id: "all", label: "All Students" },
  { id: "active", label: "Active Students" },
  { id: "inactive", label: "Inactive Students" },
  { id: "club-officer", label: "PBOOs" },
];

const PROGRAMS = [
  "BS in Accountancy / Accounting Information System",
  "BS in Information Systems / Associate in Computer Technology",
  "BS in Social Work",
  "BA in Broadcasting",
];

// Role options for students
const STUDENT_ROLE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "club-officer", label: "PBOO" },
];

function StudentUserManagement() {
  const { token, user: currentUser, refreshUserData } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    activePBOOs: 0,
    newStudentsWeek: 0,
  });

  // Modal States
  // Modal States
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(PROGRAMS[0]);
  const [confirmAction, setConfirmAction] = useState(null);

  // Add Student Modal State (ITSS only)
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Role change dropdown states
  const [roleChangeModalOpen, setRoleChangeModalOpen] = useState(false);
  const [selectedNewRole, setSelectedNewRole] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/users/stats/student-management", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Build query string
      const params = new URLSearchParams({
        page: currentPage,
        limit: rowsPerPage,
        role: "student,club-officer", // Always fetch students/PBOOs
      });

      if (searchQuery) params.set("search", searchQuery);
      
      if (selectedFilter === "active") params.set("isActive", "true");
      if (selectedFilter === "inactive") params.set("isActive", "false");
      if (selectedFilter === "club-officer") params.set("role", "club-officer");

      const response = await fetch(`/api/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users || []);
        setTotalPages(data.data.pagination.totalPages);
        setTotalUsers(data.data.pagination.totalUsers);
      } else {
        toast.error("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Error loading students");
    } finally {
      setIsLoading(false);
    }
  }, [token, currentPage, rowsPerPage, searchQuery, selectedFilter]);

  // Debounce search to prevent too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatLastActive = (date) => {
    if (!date) return "Never";
    const now = new Date();
    const lastActive = new Date(date);
    const diffMins = Math.floor((now - lastActive) / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  // Handlers
  const handleToggleStatusClick = (user) => {
    setSelectedUser(user);
    setConfirmAction("TOGGLE_STATUS");
    setConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    let payload = {};
    let successMessage = "";

    if (confirmAction === "TOGGLE_STATUS") {
      const newStatus = !selectedUser.isActive;
      payload = {
        isActive: newStatus,
      };
      successMessage = `User ${newStatus ? "enabled" : "disabled"} successfully`;
    }

    try {
      const response = await fetch(`/api/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(successMessage);
        fetchUsers(); // Refresh the list
        fetchStats(); // Refresh stats
        
        // If we updated our own account (unlikely for PSAS Head elevating students, but good practice)
        if (selectedUser._id === currentUser?._id) {
          await refreshUserData();
        }
      } else {
        toast.error(data.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("An error occurred while updating the user");
    } finally {
      setConfirmModalOpen(false);
      setSelectedUser(null);
    }
  };

  // Role change dropdown handler
  const handleRoleChangeClick = (user) => {
    setSelectedUser(user);
    setSelectedNewRole(user.role);
    setRoleChangeModalOpen(true);
  };

  const handleRoleChangeSubmit = async () => {
    if (!selectedUser) return;

    const payload = {
      role: selectedNewRole,
    };

    if (selectedNewRole === "club-officer") {
      payload.program = selectedProgram;
      payload.elevationDate = new Date().toISOString();
    } else if (selectedNewRole === "student") {
      payload.program = null;
      payload.elevationDate = null;
    }

    try {
      const response = await fetch(`/api/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Changed ${selectedUser.name}'s role to ${STUDENT_ROLE_OPTIONS.find(r => r.value === selectedNewRole)?.label || selectedNewRole}`);
        fetchUsers();
        fetchStats();

        if (selectedUser._id === currentUser?._id) {
          await refreshUserData();
        }
      } else {
        toast.error(data.message || "Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("An error occurred while updating the user role");
    } finally {
      setRoleChangeModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleAddStudent = async () => {
    try {
      if (!newStudentEmail) return;
      
      const response = await fetch("/api/users/provision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newStudentEmail,
          role: "student",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Student added successfully");
        setAddStudentModalOpen(false);
        setNewStudentEmail("");
        fetchUsers();
        fetchStats();
      } else {
        toast.error(data.message || "Failed to add student");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("An error occurred");
    }
  };

  const SkeletonText = ({ lines = 1, width = "full", height = "h-4" }) => (
    <div className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <div key={i} className={`bg-gray-200 rounded animate-pulse ${width} ${height}`} />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <SkeletonText lines={2} width="w-1/3" height="h-8" />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <SkeletonText lines={10} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Only visible to ITSS */}
      {currentUser?.position === "ITSS" && (
        <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 bg-gray-50 p-1 rounded-xl border border-gray-100 w-full max-w-sm">
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100 shadow-xs">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              
              <div className="relative flex-1 pl-1">
                <input
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="Enter student email..."
                  className="w-full py-1.5 bg-transparent border-none text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 font-medium text-sm"
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-2.5">
                  <Mail className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (!newStudentEmail.trim()) {
                    toast.error("Please enter a student email first");
                    return;
                  }
                  setAddStudentModalOpen(true);
                }}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all duration-300 shadow-md shadow-blue-50 font-bold active:scale-[0.98] group shrink-0"
              >
                <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">Add Student</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-xs sm:text-sm">Total Students</span>
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-3xl font-bold text-gray-800">
              {stats.totalStudents.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-xs sm:text-sm">Active Students</span>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-3xl font-bold text-gray-800">
              {stats.activeStudents.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-xs sm:text-sm">Active PBOOs</span>
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-3xl font-bold text-gray-800">
              {stats.activePBOOs.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-xs sm:text-sm">New This Week</span>
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-3xl font-bold text-gray-800">
              {stats.newStudentsWeek.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative w-full lg:w-auto">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="appearance-none w-full bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
            >
              {FILTER_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto -mx-px"> {/* Fixed horizontal scrolling */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  User Identity
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Role
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Department
                </th>
                 <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Program
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Year Level
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Last Active
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.profilePicture || user.avatar ? (
                        <img
                          src={user.profilePicture || user.avatar}
                          alt={user.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200"
                           onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML =
                              '<svg class="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 border border-gray-200 rounded-full bg-gray-50 p-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>';
                          }}
                        />
                      ) : (
                        <CircleUser className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 border border-gray-200 rounded-full bg-gray-50 p-1" />
                      )}
                      <div className="overflow-hidden">
                        <div className="font-bold text-gray-900 text-sm">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[140px] sm:max-w-[200px]" title={user.email}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${user.role === "club-officer" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                      {user.role === "club-officer" ? "PBOO" : "Student"}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                    {user.department || "-"}
                  </td>
                   <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                    {user.program || "-"}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                    {user.yearLevel || user.year || "-"}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <span
                        className={`w-2 h-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span className={`text-xs sm:text-sm ${user.isActive ? "text-green-600" : "text-red-600"}`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                    {formatLastActive(user.lastLogin || user.updatedAt)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">

                      {/* ITSS can Edit Role */}
                      {currentUser?.position === "ITSS" && user.isActive && (
                        <button
                          onClick={() => handleRoleChangeClick(user)}
                          className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Role"
                        >
                          <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )}

                      {/* ITSS can Disable/Enable Student and PBOO Accounts */}
                      {currentUser?.position === "ITSS" && (user.role === "student" || user.role === "club-officer") && (
                         <button
                           onClick={() => handleToggleStatusClick(user)}
                           className={`p-2 rounded-lg transition ${
                             user.isActive
                               ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                               : "text-green-500 hover:text-green-700 hover:bg-green-50"
                           }`}
                           title={user.isActive ? "Disable Account" : "Enable Account"}
                         >
                           {user.isActive ? (
                             <Ban className="w-4 h-4 sm:w-5 sm:h-5" />
                           ) : (
                             <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                           )}
                         </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-500 mt-4">
              No students found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedFilter("all");
              }}
              className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Pagination Controls */}
         <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-gray-700 text-sm">Rows:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
             <span className="text-gray-700 text-sm">
              {totalUsers} total
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">
              {currentPage} / {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F1F0F0]/80 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
            <div className="flex flex-col items-center text-center">
              <div
                className={`p-3 rounded-full mb-4 ${
                  confirmAction === "TOGGLE_STATUS"
                    ? (selectedUser?.isActive ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600")
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {confirmAction === "TOGGLE_STATUS" ? (
                  selectedUser?.isActive ? <Ban className="w-8 h-8" /> : <UserCheck className="w-8 h-8" />
                ) : (
                  <Check className="w-8 h-8" />
                )}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {confirmAction === "TOGGLE_STATUS" && (selectedUser?.isActive ? "Disable User Access?" : "Enable User Access?")}
              </h3>

              <p className="text-gray-600 mb-6">
                {confirmAction === "TOGGLE_STATUS" && (
                  selectedUser?.isActive 
                    ? `This will disable access for ${selectedUser?.name}. They won't be able to log in.`
                    : `This will restore access for ${selectedUser?.name}. They will be able to log in again.`
                )}
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`flex-1 px-4 py-2 rounded-lg text-white ${
                    selectedUser?.isActive
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Confirmation Modal */}
      {addStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F1F0F0]/80 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full mb-4 bg-blue-100 text-blue-600">
                <UserPlus className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Add New Student?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to add/provision a student account for <strong>{newStudentEmail}</strong>?
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setAddStudentModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStudent}
                  className="flex-1 px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                >
                  Confirm Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {roleChangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F1F0F0]/80 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-950 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Change User Role
              </h3>
              <button
                onClick={() => setRoleChangeModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Change role for <strong>{selectedUser?.name}</strong>
              </p>

              {/* Role Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role
                </label>
                <div className="relative">
                  <select
                    value={selectedNewRole}
                    onChange={(e) => setSelectedNewRole(e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  >
                    {STUDENT_ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Program Selection for PBOO */}
              {selectedNewRole === "club-officer" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designated Program
                  </label>
                  <div className="relative">
                    <select
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    >
                      {PROGRAMS.map((prog) => (
                        <option key={prog} value={prog}>
                          {prog}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setRoleChangeModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleChangeSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentUserManagement;
