import { Camera } from "lucide-react";
import { useAuth } from "../contexts/useAuth";
import PSASLayout from "../components/psas/PSASLayout";
import { useState } from "react";

// A simple toggle switch component
const ToggleSwitch = ({ label, enabled, setEnabled }) => (
  <div className="flex items-center justify-between py-3">
    <span className="text-gray-600">{label}</span>
    <button
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none ${
        enabled ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

function Profile() {
  const { user } = useAuth();
  const [muteNotifications, setMuteNotifications] = useState(true);
  const [muteReminders, setMuteReminders] = useState(false);

  if (!user) {
    return (
      <PSASLayout>
        <div className="flex justify-center items-center h-full">
          <p>Loading user profile...</p>
        </div>
      </PSASLayout>
    );
  }

  return (
    <PSASLayout>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            {/* My Profile Header */}
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
            </div>

            {/* Profile Details Card */}
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="relative w-40 h-40 mx-auto mb-4">
                <img
                  src={user.profilePicture || "/src/assets/users/user1.jpg"}
                  alt="Profile"
                  className="w-full h-full rounded-lg object-cover border-4 border-white shadow-sm"
                />
                <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition">
                  <Camera className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-gray-500 mt-1">Prefect of Student Affairs and Services</p>
              <p className="text-gray-500">Department Head</p>
            </div>

            {/* Account Settings Header */}
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <h2 className="text-xl font-bold text-gray-800">Account Settings</h2>
            </div>

            {/* Toggles Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="divide-y divide-gray-200">
                <ToggleSwitch
                  label="Mute Notifications?"
                  enabled={muteNotifications}
                  setEnabled={setMuteNotifications}
                />
                <ToggleSwitch
                  label="Mute Reminders?"
                  enabled={muteReminders}
                  setEnabled={setMuteReminders}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <label className="block text-gray-500 font-medium">Email Address</label>
                  <p className="text-gray-800 font-semibold mt-1">{user.email}</p>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">Position</label>
                  <p className="text-gray-800 font-semibold mt-1">{user.role || "Department Head"}</p>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">Department</label>
                  <p className="text-gray-800 font-semibold mt-1">Prefect of Student Affairs and Services Department</p>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">Access Level</label>
                  <p className="text-gray-800 font-semibold mt-1">Administrative Access</p>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">Country</label>
                  <p className="text-gray-800 font-semibold mt-1">Philippines</p>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">Timezone</label>
                  <p className="text-gray-800 font-semibold mt-1">Asia/Manila</p>
                </div>
              </div>
            </div>

            {/* Password Management Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Password Management</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Edit
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Current Password</label>
                  <input
                    type="password"
                    defaultValue="••••••••"
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="New Password"
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PSASLayout>
  );
}

export default Profile;