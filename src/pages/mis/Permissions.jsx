import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/useAuth";
import {
  Shield,
  Users,
  Search,
  Save,
  BarChart3,
  FileText,
  Share2,
} from "lucide-react";
import {
  SkeletonText,
  SkeletonBase,
  SkeletonTable,
} from "../../components/shared/SkeletonLoader";
import toast from "react-hot-toast";

// Permission definitions for each role
const PERMISSION_CONFIG = {
  psas: {
    roleLabel: "PSAS Staff",
    roleDescription: "Manage page visibility for PSAS Staff members",
    permissions: [
      {
        id: "canViewReports",
        name: "Reports",
        description: "Access to view and generate event reports",
        icon: FileText,
      },
      {
        id: "canViewAnalytics",
        name: "Analytics",
        description: "Access to event analytics and statistics",
        icon: BarChart3,
      },
    ],
  },
  mis: {
    roleLabel: "MIS Staff",
    roleDescription: "Manage page visibility for MIS Staff members",
    permissions: [
      {
        id: "canViewSharedReports",
        name: "Shared Reports",
        description: "Access to view reports shared by other users",
        icon: Share2,
      },
    ],
  },
};

function Permissions() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("psas");
  const [userPermissions, setUserPermissions] = useState({});

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
        const userList = data.data.users;
        setUsers(userList);

        // Initialize permissions state from user data
        const permissionsMap = {};
        userList.forEach((user) => {
          permissionsMap[user._id] = {
            canViewReports: user.permissions?.canViewReports ?? true,
            canViewAnalytics: user.permissions?.canViewAnalytics ?? true,
            canViewSharedReports:
              user.permissions?.canViewSharedReports ?? true,
          };
        });
        setUserPermissions(permissionsMap);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users by role and search query
  useEffect(() => {
    let filtered = users.filter((user) => user.role === selectedRole);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query),
      );
    }
    setFilteredUsers(filtered);
  }, [searchQuery, selectedRole, users]);

  const handlePermissionToggle = (userId, permissionId) => {
    setUserPermissions((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [permissionId]: !prev[userId]?.[permissionId],
      },
    }));
  };

  const handleSavePermissions = async () => {
    setIsSaving(true);
    try {
      // Only update users of the selected role
      const usersToUpdate = filteredUsers.map((user) => ({
        userId: user._id,
        permissions: userPermissions[user._id],
      }));

      const response = await fetch("/api/users/bulk-permissions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ users: usersToUpdate }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Permissions saved successfully");
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("Failed to save permissions");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle switch component
  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? "bg-blue-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  const currentConfig = PERMISSION_CONFIG[selectedRole];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <SkeletonText lines={2} width="medium" height="h-6" />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <SkeletonBase className="w-full h-12 rounded-lg mb-4" />
          <SkeletonTable rows={5} columns={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Page Permissions
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Control which pages are visible to specific users based on their
                role.
              </p>
            </div>
          </div>
          <button
            onClick={handleSavePermissions}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-50 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Role Tabs and Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Role Tabs */}
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              {Object.entries(PERMISSION_CONFIG).map(([roleId, config]) => (
                <button
                  key={roleId}
                  onClick={() => setSelectedRole(roleId)}
                  className={`px-5 py-2 rounded-md font-medium text-sm transition-all ${
                    selectedRole === roleId
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {config.roleLabel}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Info Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
            <Users className="w-4 h-4" />
            <span className="font-medium">{filteredUsers.length}</span>
            <span>{currentConfig.roleLabel} users</span>
          </div>
        </div>

        {/* Table */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              No {currentConfig.roleLabel} users found.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your search or check the role filter.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2">
                      User
                    </th>
                    {currentConfig.permissions.map((perm) => (
                      <th
                        key={perm.id}
                        className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <perm.icon className="w-4 h-4" />
                          <span>{perm.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user._id}
                      className={`hover:bg-gray-50 transition ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      {currentConfig.permissions.map((perm) => (
                        <td key={perm.id} className="px-6 py-4">
                          <div className="flex justify-center">
                            <ToggleSwitch
                              enabled={
                                userPermissions[user._id]?.[perm.id] ?? true
                              }
                              onChange={() =>
                                handlePermissionToggle(user._id, perm.id)
                              }
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <div key={user._id} className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="space-y-3 pl-13">
                    {currentConfig.permissions.map((perm) => (
                      <div
                        key={perm.id}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <perm.icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {perm.name}
                          </span>
                        </div>
                        <ToggleSwitch
                          enabled={userPermissions[user._id]?.[perm.id] ?? true}
                          onChange={() =>
                            handlePermissionToggle(user._id, perm.id)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Permissions;
