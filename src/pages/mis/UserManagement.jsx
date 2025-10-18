import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function UserManagement() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('participant');
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const { token } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('Error: Could not connect to the server.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, role }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('User created successfully!');
        setName('');
        setEmail('');
        setRole('participant');
        fetchUsers(); // Refetch users after adding a new one
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error(error)
      setMessage('Error: Could not connect to the server.');
    }
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editedUser),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('User updated successfully!');
        setEditingUserId(null);
        setEditedUser({});
        fetchUsers();
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('Error: Could not connect to the server.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <h1 className="text-2xl font-bold mb-4">Add User</h1>
          {message && <p className="mb-4">{message}</p>}
          <form onSubmit={handleSubmit} className="max-w-md">
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="role" className="block text-gray-700">Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="participant">Participant</option>
                <option value="psas">PSAS</option>
                <option value="club-officer">Club Officer</option>
                <option value="school-admin">School Admin</option>
                <option value="mis">MIS</option>
              </select>
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Add User
            </button>
          </form>
        </div>
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-4">Users</h1>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Filter by name or email"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Email</th>
                  <th className="py-2 px-4 border-b">Role</th>
                  <th className="py-2 px-4 border-b">Active</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    {editingUserId === user._id ? (
                      <>
                        <td className="py-2 px-4 border-b">
                          <input
                            type="text"
                            name="name"
                            value={editedUser.name}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="py-2 px-4 border-b">
                          <input
                            type="email"
                            name="email"
                            value={editedUser.email}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="py-2 px-4 border-b">
                          <select
                            name="role"
                            value={editedUser.role}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 border rounded"
                          >
                            <option value="participant">Participant</option>
                            <option value="psas">PSAS</option>
                            <option value="club-officer">Club Officer</option>
                            <option value="school-admin">School Admin</option>
                            <option value="mis">MIS</option>
                          </select>
                        </td>
                        <td className="py-2 px-4 border-b">
                          <select
                            name="isActive"
                            value={editedUser.isActive}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 border rounded"
                          >
                            <option value={true}>Yes</option>
                            <option value={false}>No</option>
                          </select>
                        </td>
                        <td className="py-2 px-4 border-b">
                          <button onClick={handleUpdateUser} className="bg-green-500 text-white px-2 py-1 rounded mr-2">Save</button>
                          <button onClick={handleCancelEdit} className="bg-red-500 text-white px-2 py-1 rounded">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-4 border-b">{user.name}</td>
                        <td className="py-2 px-4 border-b">{user.email}</td>
                        <td className="py-2 px-4 border-b">{user.role}</td>
                        <td className="py-2 px-4 border-b">{user.isActive ? 'Yes' : 'No'}</td>
                        <td className="py-2 px-4 border-b">
                          <button onClick={() => handleEdit(user)} className="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;