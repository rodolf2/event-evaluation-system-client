import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/useAuth";
import { Search, Plus, Edit, Trash2, Save, X, UserPlus } from "lucide-react";
import AddUserModal from "../../components/mis/AddUserModal";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { token } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setFilteredUsers(
      users.filter(
        (user) =>
          user.name.toLowerCase().includes(filter.toLowerCase()) ||
          user.email.toLowerCase().includes(filter.toLowerCase())
      )
    );
  }, [filter, users]);

  const handleAddUser = () => {
    fetchUsers(); // Refetch users after adding a new one
  };

  const handleEdit = (user) => {
    setEditingUserId(user._id);
    setEditedUser({ ...user });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditedUser({});
  };

  const handleUpdateUser = async () => {
    try {
      const response = await fetch(`/api/users/${editingUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedUser),
      });

      const data = await response.json();

      if (data.success) {
        setEditingUserId(null);
        setEditedUser({});
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          fetchUsers();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Convert isActive string to boolean
    if (name === "isActive") {
      setEditedUser((prev) => ({ ...prev, [name]: value === "true" }));
    } else {
      setEditedUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleAddModal = () => {
    setIsAddModalOpen(!isAddModalOpen);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <button
            onClick={toggleAddModal}
            className="bg-blue-950 hover:bg-blue-900 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={toggleAddModal}
        onUserAdded={handleAddUser}
      />

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  {editingUserId === user._id ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="name"
                          value={editedUser.name}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="email"
                          name="email"
                          value={editedUser.email}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          name="role"
                          value={editedUser.role}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="participant">Participant</option>
                          <option value="psas">PSAS</option>
                          <option value="club-officer">Club Officer</option>
                          <option value="school-admin">School Admin</option>
                          <option value="mis">MIS</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          name="isActive"
                          value={editedUser.isActive}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleUpdateUser}
                            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user._id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-600">{user.email}</div>
                        <div className="text-xs text-gray-400">
                          {user.googleId || "Local Account"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "mis"
                              ? "bg-red-100 text-red-800"
                              : user.role === "psas"
                              ? "bg-blue-100 text-blue-800"
                              : user.role === "school-admin"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "club-officer"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role.replace("-", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500">
              No users found matching your search criteria.
            </p>
            <button
              onClick={() => setFilter("")}
              className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
