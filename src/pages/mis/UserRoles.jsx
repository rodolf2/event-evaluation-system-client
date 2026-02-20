import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/useAuth";
import { useSocket } from "../../contexts/SocketContext";
import {
  Search,
  Users,
  Clock,
  Building,
  AlertCircle,
  ChevronLeft,
  ChevronRight,

  Ban,
  X,
  UserCheck,
  CircleUser,
  Shield,
  BarChart3,
  FileText,
  Share2,
  Pencil,
  ChevronDown,
} from "lucide-react";
import {
  SkeletonTable,
  SkeletonText,
} from "../../components/shared/SkeletonLoader";
import toast from "react-hot-toast";
import dayjs from "dayjs";

// Role badge colors
const ROLE_COLORS = {
  student: { bg: "bg-blue-100", text: "text-blue-700", label: "Student" },
  "club-officer": {
    bg: "bg-orange-100",
    text: "text-orange-700",
    label: "PBOO",
  },
  psas: { bg: "bg-purple-100", text: "text-purple-700", label: "PSAS Staff" },
  mis: { bg: "bg-red-100", text: "text-red-700", label: "MIS Staff" },
  "senior-management": {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Senior Mgmt",
  },
  "club-adviser": {
    bg: "bg-teal-100",
    text: "text-teal-700",
    label: "Club Adviser",
  },
};

// Available roles for dropdown
const ROLE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "club-officer", label: "PBOO" },
  { value: "psas", label: "PSAS Staff" },
  { value: "mis", label: "MIS Staff" },
  { value: "club-adviser", label: "Club Adviser" },
];

// Available positions for staff
const POSITION_OPTIONS = {
  psas: [
    { value: "PSAS Staff", label: "PSAS Staff" },
    { value: "PSAS Head", label: "PSAS Head" },
    { value: "ITSS", label: "ITSS" },
  ],
  mis: [
    { value: "MIS Staff", label: "MIS Staff" },
    { value: "MIS Head", label: "MIS Head" },
  ],
};

// Filter options

// Filter options
const FILTER_OPTIONS = [
  { id: "all", label: "All Users" },
  { id: "student", label: "Students" },
  { id: "club-officer", label: "PBOOs" },
  { id: "psas", label: "PSAS Staff" },
  { id: "mis", label: "MIS Staff" },
  { id: "senior-management", label: "Senior Mgmt" },
  { id: "club-adviser", label: "Club Adviser" },
];

const PROGRAMS = [
  "BS in Accountancy / Accounting Information System",
  "BS in Information Systems / Associate in Computer Technology",
  "BS in Social Work",
  "BA in Broadcasting",
];

function UserRoles() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePBOOs: 0,
    facultyStaff: 0,
    suspended: 0,
    newUsersWeek: 0,
  });

  // Modal States
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(PROGRAMS[0]);
  const [confirmAction, setConfirmAction] = useState(null); // 'ELEVATE', 'REMOVE_PBOO', 'DISABLE', 'ELEVATE_HEAD', 'REMOVE_HEAD'

  // Role change dropdown states
  const [roleChangeModalOpen, setRoleChangeModalOpen] = useState(false);
  const [selectedNewRole, setSelectedNewRole] = useState("");
  const [selectedNewPosition, setSelectedNewPosition] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const { token, user: currentUser, refreshUserData } = useAuth();
  const socket = useSocket();

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/users/stats/user-management", {
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
    if (!token) return;
    setIsLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams({
        page: currentPage,
        limit: rowsPerPage,
      });

      if (searchQuery) params.append("search", searchQuery);
      if (selectedFilter !== "all") params.append("role", selectedFilter);

      const response = await fetch(`/api/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        const userList = data.data.users.map((u) => ({
          ...u,
          // Simulate existing data for demo if needed, or rely on future API updates
          program: u.program || "",
          elevationDate: u.elevationDate || null,
        }));
        setUsers(userList);
        setTotalPages(data.data.pagination.totalPages);
        setTotalUsers(data.data.pagination.totalUsers);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }, [token, currentPage, rowsPerPage, searchQuery, selectedFilter]);

  // Real-time listener
  useEffect(() => {
    if (socket) {
      socket.on("user-updated", (updatedUser) => {
        console.log("👥 Real-time user update received:", updatedUser);
        fetchUsers();
        fetchStats();
      });

      return () => {
        socket.off("user-updated");
      };
    }
  }, [socket, fetchUsers, fetchStats]);

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

  // Handlers
  const handleDisableClick = (user) => {
    setSelectedUser(user);
    setConfirmAction("DISABLE");
    setConfirmModalOpen(true);
  };

  const handleEnableClick = (user) => {
    setSelectedUser(user);
    setConfirmAction("ENABLE");
    setConfirmModalOpen(true);
  };

  // Role change dropdown handler
  const handleRoleChangeClick = (user) => {
    setSelectedUser(user);
    setSelectedNewRole(user.role);
    setSelectedNewPosition(user.position || "");
    setRoleChangeModalOpen(true);
  };

  const handleRoleChangeSubmit = async () => {
    if (!selectedUser) return;

    const payload = {
      role: selectedNewRole,
    };

    // Set appropriate position based on role
    if (selectedNewRole === "psas" || selectedNewRole === "mis") {
      payload.position = selectedNewPosition || (selectedNewRole === "psas" ? "PSAS Staff" : "MIS Staff");
      
      // Set permissions based on position
      if (selectedNewPosition === "PSAS Head" || selectedNewPosition === "MIS Head") {
        payload.permissions = {
          canViewReports: true,
          canViewAnalytics: selectedNewPosition === "PSAS Head",
        };
        payload.elevationDate = new Date().toISOString();
      } else if (selectedNewPosition === "ITSS") {
        payload.permissions = {
          canViewReports: false,
          canViewAnalytics: false,
        };
        payload.elevationDate = new Date().toISOString();
      } else {
        payload.permissions = {
          canViewReports: false,
          canViewAnalytics: false,
        };
        payload.elevationDate = null;
      }
    } else if (selectedNewRole === "club-officer") {
      payload.program = selectedProgram;
      payload.elevationDate = new Date().toISOString();
      payload.position = null;
    } else if (selectedNewRole === "student") {
      payload.program = null;
      payload.elevationDate = null;
      payload.position = null;
    } else if (selectedNewRole === "club-adviser") {
      payload.position = "Club Adviser";
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
        toast.success(`Changed ${selectedUser.name}'s role to ${ROLE_OPTIONS.find(r => r.value === selectedNewRole)?.label || selectedNewRole}`);
        fetchUsers();

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

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    let payload = {};
    let successMessage = "";

    if (confirmAction === "DISABLE") {
      payload = {
        isActive: false,
      };
      successMessage = `Disabled access for ${selectedUser.name}`;
    } else if (confirmAction === "ENABLE") {
      payload = {
        isActive: true,
      };
      successMessage = `Reactivated access for ${selectedUser.name}`;
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

        // If we updated our own account, refresh the auth context
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

  // Helpers
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

  const getRoleBadge = (user) => {
    const roleConfig = ROLE_COLORS[user.role] || ROLE_COLORS.student;
    let label = roleConfig.label;

    // Show "Head" or "ITSS" in badge if applicable
    if (
      user.position === "MIS Head" ||
      user.position === "PSAS Head" ||
      user.position === "ITSS"
    ) {
      label = user.position;
    }

    return (
      <span
        className={`px-3 py-1 rounded-md text-xs font-medium ${roleConfig.bg} ${roleConfig.text}`}
      >
        {label}
      </span>
    );
  };

  const getRemarks = (user) => {
    if (user.elevationDate && (user.role === "club-officer" || user.position?.includes("Head"))) {
      return (
        <span className="text-sm text-gray-500 italic">
          {user.position?.includes("Head") ? "Promoted" : "Elevated"} on{" "}
          {dayjs(user.elevationDate).format("MMMM DD, YYYY")}
        </span>
      );
    }
    return <span className="text-gray-400">-</span>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <SkeletonText lines={2} width="medium" height="h-6" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <SkeletonText lines={2} width="full" height="h-8" />
            </div>
          ))}
        </div>
        <SkeletonTable rows={8} columns={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              User & Role Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage system access, elevate PBOO roles, and synchronize
              accounts.
            </p>
          </div>
        </div>
      </div> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Total Users</span>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-gray-800">
              {stats.totalUsers.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            + {stats.newUsersWeek} new this week
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Active PBOOs</span>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-gray-800">
              {stats.activePBOOs}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Current Term</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Faculty & Staff</span>
            <Building className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-gray-800">
              {stats.facultyStaff}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Authorized</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Inactive</span>
            <AlertCircle className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-gray-800">
              {stats.suspended}
            </span>
          </div>
          <p className="text-xs text-red-600 mt-1">Action Required</p>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
        {/* Mobile Card Layout */}
        <div className="block lg:hidden">
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {user.profilePicture || user.avatar ? (
                      <img
                        src={
                          user.profilePicture ||
                          user.avatar
                        }
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML =
                            '<svg class="w-10 h-10 text-gray-400 border border-gray-200 rounded-full bg-gray-50 p-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>';
                        }}
                      />
                    ) : (
                      <CircleUser className="w-10 h-10 text-gray-400 border border-gray-200 rounded-full bg-gray-50 p-1" />
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {/* Disable/Enable Actions - Available to MIS Staff for ALL users (except Head/Self) */}
                    {/* Also available to PSAS Head/ITSS for Students/PBOOs only */}
                    {((currentUser?.role === "mis") || 
                      ((user.role === "student" || user.role === "club-officer") && currentUser?.role === "psas")) && 
                      user._id !== currentUser?._id && 
                      user.position !== "MIS Head" && (
                      <>
                        {user.isActive ? (
                          <button
                            onClick={() => handleDisableClick(user)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Disable Access"
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnableClick(user)}
                            className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition"
                            title="Reactivate User"
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {getRoleBadge(user)}
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                    />
                    <span
                      className={
                        user.isActive ? "text-green-600" : "text-red-600"
                      }
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">
                    {formatLastActive(user.lastLogin || user.updatedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Identity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.profilePicture || user.avatar ? (
                        <img
                          src={
                            user.profilePicture ||
                            user.avatar
                          }
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML =
                              '<svg class="w-10 h-10 text-gray-400 border border-gray-200 rounded-full bg-gray-50 p-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>';
                          }}
                        />
                      ) : (
                        <CircleUser className="w-10 h-10 text-gray-400 border border-gray-200 rounded-full bg-gray-50 p-1" />
                      )}
                      <div>
                        <div className="font-bold text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(user)}
                  </td>
                  <td className="px-6 py-4">{getRemarks(user)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"
                          }`}
                      />
                      <span
                        className={
                          user.isActive ? "text-green-600" : "text-red-600"
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatLastActive(user.lastLogin || user.updatedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* MIS Head Edit Role (except student/PBOO) */}
                      {currentUser?.position === "MIS Head" && 
                       user._id !== currentUser?._id && 
                       user.role !== "student" && 
                       user.role !== "club-officer" && (
                        <button
                          onClick={() => handleRoleChangeClick(user)}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Role"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      )}
                      {/* Disable/Enable Actions */}
                      {((currentUser?.role === "mis") || 
                        ((user.role === "student" || user.role === "club-officer") && currentUser?.role === "psas")) && 
                        user._id !== currentUser?._id && 
                        user.position !== "MIS Head" && (
                        <>
                          {user.isActive ? (
                            <button
                              onClick={() => handleDisableClick(user)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Disable Access"
                            >
                              <Ban className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEnableClick(user)}
                              className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition"
                              title="Reactivate User"
                            >
                              <UserCheck className="w-5 h-5" />
                            </button>
                          )}
                        </>
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
              No users found matching your criteria.
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
            <span className="text-gray-700 text-sm">Rows per page:</span>
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
                  confirmAction === "DISABLE"
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {confirmAction === "DISABLE" ? <Ban className="w-8 h-8" /> : <UserCheck className="w-8 h-8" />}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {confirmAction === "DISABLE" ? "Disable User Access?" : "Reactivate User?"}
              </h3>

              <p className="text-gray-600 mb-6">
                {confirmAction === "DISABLE"
                  ? `This will disable access for ${selectedUser?.name}. They won't be able to log in.`
                  : `This will restore access for ${selectedUser?.name}. They will be able to log in again.`}
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
                    confirmAction === "DISABLE"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Confirm
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
                    onChange={(e) => {
                      setSelectedNewRole(e.target.value);
                      // Reset position when role changes
                      if (e.target.value === "psas") {
                        setSelectedNewPosition("PSAS Staff");
                      } else if (e.target.value === "mis") {
                        setSelectedNewPosition("MIS Staff");
                      } else {
                        setSelectedNewPosition("");
                      }
                    }}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  >
                    {ROLE_OPTIONS.filter(role => {
                      if (currentUser?.position === "MIS Head") {
                        return role.value !== "student" && role.value !== "club-officer";
                      }
                      return true;
                    }).map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Position Selection for PSAS/MIS */}
              {(selectedNewRole === "psas" || selectedNewRole === "mis") && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Position
                  </label>
                  <div className="relative">
                    <select
                      value={selectedNewPosition}
                      onChange={(e) => setSelectedNewPosition(e.target.value)}
                      className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    >
                      {POSITION_OPTIONS[selectedNewRole]?.map((pos) => (
                        <option key={pos.value} value={pos.value}>
                          {pos.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              )}

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

export default UserRoles;
