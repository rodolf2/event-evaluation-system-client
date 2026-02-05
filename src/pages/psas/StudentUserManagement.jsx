import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  Users,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUser,
  ArrowUpCircle,
  ArrowDownCircle,
  Ban,
  UserCheck,
  X,
  UserPlus,
  Mail,
  Check,
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
  const [choiceModalOpen, setChoiceModalOpen] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [elevationModalOpen, setElevationModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(PROGRAMS[0]);
  const [confirmAction, setConfirmAction] = useState(null);

  // Add Student Modal State (ITSS only)
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users?role=student,club-officer&limit=0", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        // The API returns { data: { users: [], pagination: {} } }
        // We need to access data.data.users
        const userList = data.data.users || [];
        setUsers(userList);
        calculateStats(userList);
      } else {
        toast.error("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Error loading students");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (userList) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    setStats({
      totalStudents: userList.length,
      activeStudents: userList.filter((u) => u.isActive && u.role === "student").length,
      activePBOOs: userList.filter((u) => u.isActive && u.role === "club-officer").length,
      newStudentsWeek: userList.filter(
        (u) => new Date(u.createdAt) > oneWeekAgo
      ).length,
    });
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      const matchesSearch =
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status/Role filter
      let matchesFilter = true;
      if (selectedFilter === "active") {
        matchesFilter = user.isActive;
      } else if (selectedFilter === "inactive") {
        matchesFilter = !user.isActive;
      } else if (selectedFilter === "club-officer") {
        matchesFilter = user.role === "club-officer";
      }

      return matchesSearch && matchesFilter;
    });
  }, [users, searchQuery, selectedFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

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
  const handleElevateClick = (user) => {
    setSelectedUser(user);
    setSelectedChoice(null);
    setChoiceModalOpen(true);
  };

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice);
    setChoiceModalOpen(false);
    setSelectedProgram(PROGRAMS[0]);
    setElevationModalOpen(true);
  };

  const handleRemovePBOOClick = (user) => {
    setSelectedUser(user);
    setConfirmAction("REMOVE_PBOO");
    setConfirmModalOpen(true);
  };

  const handleToggleStatusClick = (user) => {
    setSelectedUser(user);
    setConfirmAction("TOGGLE_STATUS");
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
      successMessage = `Elevated ${selectedUser.name} to PBOO (${selectedProgram})`;
    } else if (confirmAction === "REMOVE_PBOO") {
      payload = {
        role: "student",
        program: null,
        elevationDate: null,
      };
      successMessage = `Removed PBOO role from ${selectedUser.name}`;
    } else if (confirmAction === "TOGGLE_STATUS") {
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

  const handleAddStudent = async () => {
    // ... existed code ...
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
                disabled={isProvisioning}
              >
                <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">Add Student</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Total Students</span>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-gray-800">
              {stats.totalStudents.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Active Students</span>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-gray-800">
              {stats.activeStudents.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Active PBOOs</span>
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-gray-800">
              {stats.activePBOOs.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">New This Week</span>
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-gray-800">
              {stats.newStudentsWeek.toLocaleString()}
            </span>
          </div>
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
              placeholder="Search students..."
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
                  Department
                </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year Level
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
              {paginatedUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.profilePicture || user.avatar ? (
                        <img
                          src={user.profilePicture || user.avatar}
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
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.department || "-"}
                  </td>
                   <td className="px-6 py-4 text-sm text-gray-600">
                    {user.program || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.yearLevel || user.year || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span
                        className={`w-2 h-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span className={`text-sm ${user.isActive ? "text-green-600" : "text-red-600"}`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatLastActive(user.lastLogin || user.updatedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Only PSAS Head can manage PBOO roles */}
                      {currentUser?.position === "PSAS Head" && (
                        <>
                          {user.role === "student" && user.isActive && (
                            <button
                              onClick={() => handleElevateClick(user)}
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                              title="Elevate to PBOO"
                            >
                              <ArrowUpCircle className="w-5 h-5" />
                            </button>
                          )}
                          {user.role === "club-officer" && user.isActive && (
                            <button
                              onClick={() => handleRemovePBOOClick(user)}
                              className="p-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition"
                              title="Remove PBOO Role"
                            >
                              <ArrowDownCircle className="w-5 h-5" />
                            </button>
                          )}
                        </>
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
                             <Ban className="w-5 h-5" />
                           ) : (
                             <UserCheck className="w-5 h-5" />
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
        {filteredUsers.length === 0 && (
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
              {filteredUsers.length} total
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
              Page {currentPage} of {Math.max(1, totalPages)}
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

      {/* Choice Selection Modal */}
      {choiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F1F0F0]/80 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-950 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Elevate to PBOO
              </h3>
              <button
                onClick={() => setChoiceModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Select an option for <strong>{selectedUser?.name}</strong>.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleChoiceSelect("Executive")}
                  className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="font-medium text-gray-900">
                    Presidents, VPs, and Secretaries
                  </div>
                  <div className="text-sm text-gray-500">
                    Designated for top-level student organization leaders.
                  </div>
                </button>
                <button
                  onClick={() => handleChoiceSelect("Officer")}
                  className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="font-medium text-gray-900">
                    Other Officers
                  </div>
                  <div className="text-sm text-gray-500">
                    Designated for other student organization committee members.
                  </div>
                </button>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setChoiceModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Elevation Input Modal */}
      {elevationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F1F0F0]/80 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-950 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Elevate to PBOO
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
                  confirmAction === "REMOVE_PBOO"
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {confirmAction === "ELEVATE" && (
                  <ArrowUpCircle className="w-8 h-8" />
                )}
                {confirmAction === "REMOVE_PBOO" && (
                  <ArrowDownCircle className="w-8 h-8" />
                )}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {confirmAction === "ELEVATE" && "Confirm Elevation"}
                {confirmAction === "REMOVE_PBOO" && "Remove PBOO Role?"}
                {confirmAction === "TOGGLE_STATUS" && (selectedUser?.isActive ? "Disable Student?" : "Enable Student?")}
              </h3>

              <p className="text-gray-600 mb-6">
                {confirmAction === "ELEVATE" &&
                  `Are you sure you want to elevate ${selectedUser?.name} to PBOO (${
                    selectedChoice === "Executive"
                      ? "Presidents, VPs, and Secretaries"
                      : "Other Officers"
                  }) for ${selectedProgram}?`}
                {confirmAction === "REMOVE_PBOO" &&
                  `This will revert ${selectedUser?.name} to a regular Student role.`}
                {confirmAction === "TOGGLE_STATUS" &&
                  `Are you sure you want to ${selectedUser?.isActive ? "disable" : "enable"} ${selectedUser?.name}?`}
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
                    confirmAction === "REMOVE_PBOO" || (confirmAction === "TOGGLE_STATUS" && selectedUser?.isActive)
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

      {/* Add Student Confirmation Modal (ITSS Only) */}
      {addStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-950 px-6 py-4 flex justify-between items-center border-b border-blue-900">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Confirm Addition
              </h3>
              <button
                onClick={() => setAddStudentModalOpen(false)}
                className="text-blue-100 hover:text-white transition-colors"
                disabled={isProvisioning}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-600 mb-2">Are you sure you want to add this student?</p>
              <p className="text-xl font-bold text-gray-900 break-all bg-gray-50 p-3 rounded-lg border border-gray-100">
                {newStudentEmail}
              </p>
              
              <p className="text-xs text-gray-500 mt-4 italic">
                This will provision a new student account with default permissions.
              </p>

              <div className="flex gap-3 justify-center mt-8">
                <button
                  onClick={() => setAddStudentModalOpen(false)}
                  className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  disabled={isProvisioning}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStudent}
                  disabled={isProvisioning}
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 font-medium transition-all shadow-lg shadow-blue-200"
                >
                  {isProvisioning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirm Add
                    </>
                  )}
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
