import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/useAuth";
import {
  Search,
  Download,
  RefreshCw,
  Users,
  Clock,
  Building,
  AlertCircle,
  ChevronDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
    X,
  UserCheck
} from "lucide-react";
import {
  SkeletonTable,
  SkeletonText,
} from "../../components/shared/SkeletonLoader";
import toast from "react-hot-toast";
import dayjs from "dayjs";

// Role badge colors
const ROLE_COLORS = {
  participant: { bg: "bg-blue-100", text: "text-blue-700", label: "Student" },
  "club-officer": {
    bg: "bg-orange-100",
    text: "text-orange-700",
    label: "PSCO",
  },
  psas: { bg: "bg-purple-100", text: "text-purple-700", label: "PSAS Staff" },
  mis: { bg: "bg-red-100", text: "text-red-700", label: "MIS Staff" },
  "school-admin": {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Senior Mgmt",
  },
};

// Filter options
const FILTER_OPTIONS = [
  { id: "all", label: "All Users" },
  { id: "participant", label: "Students" },
  { id: "club-officer", label: "PSCOs" },
  { id: "psas", label: "Staff" },
  { id: "mis", label: "MIS Staff" },
  { id: "school-admin", label: "Senior Mgmt" },
];

const PROGRAMS = [
  "BS in Accountancy",
  "BS in Information Systems",
  "BS in Social Work",
];

function UserRoles() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePSCOs: 0,
    facultyStaff: 0,
    suspended: 0,
    newUsersWeek: 0,
  });

  // Modal States
  const [elevationModalOpen, setElevationModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(PROGRAMS[0]);
  const [confirmAction, setConfirmAction] = useState(null); // 'ELEVATE', 'REMOVE_PSCO', 'DISABLE'

  const { token } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/users", {
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
        updateStats(userList);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const updateStats = (userList) => {
    const totalUsers = userList.length;
    const activePSCOs = userList.filter(
      (u) => u.role === "club-officer" && u.isActive
    ).length;
    const facultyStaff = userList.filter(
      (u) => u.role === "psas" || u.role === "mis"
    ).length;
    const suspended = userList.filter((u) => !u.isActive).length;

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersWeek = userList.filter(
      (u) => new Date(u.createdAt) > oneWeekAgo
    ).length;

    setStats({
      totalUsers,
      activePSCOs,
      facultyStaff,
      suspended,
      newUsersWeek,
    });
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter logic
  useEffect(() => {
    let filtered = users;
    if (selectedFilter !== "all") {
      filtered = filtered.filter((user) => user.role === selectedFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user._id.toLowerCase().includes(query)
      );
    }
    setFilteredUsers(filtered);
  }, [searchQuery, selectedFilter, users]);

  // Handlers
  const handleElevateClick = (user) => {
    setSelectedUser(user);
    setSelectedProgram(PROGRAMS[0]);
    setElevationModalOpen(true);
  };

  const handleRemovePSCOClick = (user) => {
    setSelectedUser(user);
    setConfirmAction("REMOVE_PSCO");
    setConfirmModalOpen(true);
  };

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

  const handleElevationSubmit = () => {
    setElevationModalOpen(false);
    setConfirmAction("ELEVATE");
    setConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    let payload = {};
    let successMessage = "";

    if (confirmAction === "ELEVATE") {
      payload = {
        role: "club-officer",
        program: selectedProgram,
        elevationDate: new Date().toISOString(),
      };
      successMessage = `Elevated ${selectedUser.name} to PSCO (${selectedProgram})`;
    } else if (confirmAction === "REMOVE_PSCO") {
      payload = {
        role: "participant",
        program: null,
        elevationDate: null,
      };
      successMessage = `Removed PSCO role from ${selectedUser.name}`;
    } else if (confirmAction === "DISABLE") {
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
    const roleConfig = ROLE_COLORS[user.role] || ROLE_COLORS.participant;
    let label = roleConfig.label;

    return (
      <span
        className={`px-3 py-1 rounded-md text-xs font-medium ${roleConfig.bg} ${roleConfig.text}`}
      >
        {label}
      </span>
    );
  };

  const getRemarks = (user) => {
    if (user.elevationDate && user.role === "club-officer") {
      return (
        <span className="text-sm text-gray-500 italic">
          Role is elevated on{" "}
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              User & Role Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage system access, elevate PSCO roles, and synchronize
              accounts.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-lg transition">
              <RefreshCw className="w-4 h-4" />
              Bulk Sync (Google SSO)
            </button>
          </div>
        </div>
      </div>

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
            <span className="text-gray-600 text-sm">Active PSCOs</span>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-gray-800">
              {stats.activePSCOs}
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
        <div className="overflow-x-auto">
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
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(user)}</td>
                  <td className="px-6 py-4">{getRemarks(user)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          user.isActive ? "bg-green-500" : "bg-red-500"
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
                      {/* Show Actions based on Role and Active Status */}
                      {user.role === "participant" && user.isActive && (
                        <>
                          <button
                            onClick={() => handleElevateClick(user)}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                            title="Elevate to PSCO"
                          >
                            <ArrowUpCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {user.role === "club-officer" && user.isActive && (
                        <button
                          onClick={() => handleRemovePSCOClick(user)}
                          className="p-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition"
                          title="Remove PSCO Role"
                        >
                          <ArrowDownCircle className="w-5 h-5" />
                        </button>
                      )}

                      {(user.role === "participant" ||
                        user.role === "club-officer") &&
                        user.isActive && (
                          <button
                            onClick={() => handleDisableClick(user)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove from User Table (Disable Access)"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}

                      {/* For already suspended users */}
                      {!user.isActive &&
                        (user.role === "participant" ||
                          user.role === "club-officer") && (
                          <button
                            onClick={() => handleEnableClick(user)}
                            className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition"
                            title="Reactivate User"
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                        )}

                      {/* Fallback for other roles (Staff) */}
                      {user.role !== "participant" &&
                        user.role !== "club-officer" && (
                          <div className="text-gray-400 text-xs">-</div>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredUsers.length === 0 && (
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
      </div>

      {/* Elevation Input Modal */}
      {elevationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F1F0F0]/80 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-950 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Elevate to PSCO
              </h3>
              <button
                onClick={() => setElevationModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Select the program designated for{" "}
                <strong>{selectedUser?.name}</strong>.
              </p>

              <div className="mb-6">
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

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setElevationModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleElevationSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                {confirmAction === "DISABLE" && <Trash2 className="w-8 h-8" />}
                {confirmAction === "ELEVATE" && (
                  <ArrowUpCircle className="w-8 h-8" />
                )}
                {confirmAction === "REMOVE_PSCO" && (
                  <ArrowDownCircle className="w-8 h-8" />
                )}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {confirmAction === "ELEVATE" && "Confirm Elevation"}
                {confirmAction === "REMOVE_PSCO" && "Remove PSCO Role?"}
                {confirmAction === "DISABLE" && "Disable User Access?"}
                {confirmAction === "ENABLE" && "Reactivate User?"}
              </h3>

              <p className="text-gray-600 mb-6">
                {confirmAction === "ELEVATE" &&
                  `Are you sure you want to elevate ${selectedUser?.name} to PSCO for ${selectedProgram}?`}
                {confirmAction === "REMOVE_PSCO" &&
                  `This will revert ${selectedUser?.name} to a regular Student role.`}
                {confirmAction === "DISABLE" &&
                  `This will disable access for ${selectedUser?.name}. They won't be able to log in.`}
                {confirmAction === "ENABLE" &&
                  `This will restore access for ${selectedUser?.name}. They will be able to log in again.`}
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
    </div>
  );
}

export default UserRoles;
