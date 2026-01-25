import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../../contexts/useAuth";
import {
  Mail,
  Check,
  Shield,
  X,
  UserPlus,
  GraduationCap,
  ClipboardList,
  Users,
  School,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  SkeletonText,
  SkeletonBase,
} from "../../components/shared/SkeletonLoader";

// Role definitions with descriptions
const ROLES = [
  {
    id: "student",
    name: "Student (Default)",
    description: "Can respond to evaluations and view their own certificates.",
    icon: GraduationCap,
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "psas",
    name: "PSAS Staff",
    description: "Can create events and manage student evaluations.",
    icon: ClipboardList,
    color: "bg-purple-100 text-purple-700",
  },

  {
    id: "senior-management",
    name: "Senior Management",
    description: "Can view all reports and analytics across departments.",
    icon: School,
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: "mis",
    name: "MIS Administrator",
    description: "Full system access including user management and settings.",
    icon: Shield,
    color: "bg-red-100 text-red-700",
  },
];

// Permission categories and items
const PERMISSIONS = {
  evaluationSurveys: {
    title: "Evaluation & Surveys",
    description: "Template applies to all roles; toggle per-role needs.",
    items: [
      {
        id: "submit_evaluations",
        name: "Submit evaluations",
        description: "User can fill out surveys where they are a participant.",
      },
      {
        id: "view_aggregated_results",
        name: "View aggregated results",
        description:
          "Access event-level summaries without raw identifiable feedback.",
      },
      {
        id: "access_raw_feedback",
        name: "Access raw feedback data",
        description:
          "Includes identifiable responses; restricted for students and most staff.",
      },
    ],
  },
  eventsAttendance: {
    title: "Events & Attendance",
    description:
      "Enabled features depend on role (e.g., PSAS Staff vs Student).",
    type: "Operational",
    items: [
      {
        id: "view_event_calendar",
        name: "View event calendar",
        description:
          "See upcoming and past events where the user is a participant.",
      },
      {
        id: "manage_attendance",
        name: "Manage attendance",
        description: "Scan QR codes and update attendance records.",
      },
      {
        id: "create_edit_events",
        name: "Create or edit events",
        description:
          "Create new events and modify event details within authorized scope.",
      },
    ],
  },
  systemGovernance: {
    title: "System & Governance",
    description: "Reserved for MIS Staff and Senior Management.",
    type: "Restricted",
    items: [
      {
        id: "view_audit_logs",
        name: "View audit logs",
        description:
          "Access immutable technical audit trails for compliance (FR16).",
      },
      {
        id: "manage_roles_provisioning",
        name: "Manage roles and provisioning",
        description: "Grant or revoke roles for users (FR14 – MIS only).",
      },
      {
        id: "access_system_configuration",
        name: "Access system configuration",
        description:
          "Modify global parameters such as maintenance mode (FR15).",
      },
    ],
  },
};

// Default permissions per role
const DEFAULT_PERMISSIONS = {
  student: {
    submit_evaluations: true,
    view_aggregated_results: false,
    access_raw_feedback: false,
    view_event_calendar: true,
    manage_attendance: false,
    create_edit_events: false,
    view_audit_logs: false,
    manage_roles_provisioning: false,
    access_system_configuration: false,
  },
  psas: {
    submit_evaluations: true,
    view_aggregated_results: true,
    access_raw_feedback: true,
    view_event_calendar: true,
    manage_attendance: true,
    create_edit_events: true,
    view_audit_logs: false,
    manage_roles_provisioning: false,
    access_system_configuration: false,
  },
  mis: {
    submit_evaluations: false,
    view_aggregated_results: true,
    access_raw_feedback: false,
    view_event_calendar: true,
    manage_attendance: false,
    create_edit_events: false,
    view_audit_logs: true,
    manage_roles_provisioning: true,
    access_system_configuration: true,
  },
  "senior-management": {
    submit_evaluations: false,
    view_aggregated_results: true,
    access_raw_feedback: false,
    view_event_calendar: true,
    manage_attendance: false,
    create_edit_events: false,
    view_audit_logs: true,
    manage_roles_provisioning: false,
    access_system_configuration: false,
  },
};

function UserManagement() {
  const { token } = useAuth();
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS.student);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  // Handle role selection
  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setPermissions(DEFAULT_PERMISSIONS[roleId]);
  };

  // Handle permission toggle
  const handlePermissionToggle = (permissionId) => {
    setPermissions((prev) => ({
      ...prev,
      [permissionId]: !prev[permissionId],
    }));
  };

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address.");
      return;
    }

    setIsSubmitting(true);
    setSuccess("");

    try {
      const response = await fetch("/api/users/provision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          role: selectedRole,
          permissions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(
          `User ${email} has been provisioned with the ${selectedRole} role.`,
        );
        setEmail("");
        setSelectedRole("student");
        setPermissions(DEFAULT_PERMISSIONS.student);
        setShowConfirmModal(false);
      } else {
        toast.error(data.message || "Failed to provision user.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while provisioning the user.");
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  }, [email, selectedRole, permissions, token]);

  // Handle opening confirm modal
  const handleAddUser = () => {
    if (!email.trim()) {
      toast.error("Please enter an email address.");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleCancel = () => {
    setEmail("");
    setSelectedRole("student");
    setPermissions(DEFAULT_PERMISSIONS.student);
    setSuccess("");
  };

  // Get current role name for display
  const currentRoleName =
    ROLES.find((r) => r.id === selectedRole)?.name || "Student";

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <SkeletonText lines={1} width="medium" height="h-8" />
              <SkeletonText lines={1} width="large" height="h-4" />
            </div>
            <SkeletonBase className="w-48 h-10 rounded-lg" />
          </div>
          <div className="mt-6">
            <SkeletonText lines={1} width="small" height="h-4" />
            <SkeletonBase className="w-full max-w-xl h-12 rounded-lg mt-2" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <SkeletonText lines={1} width="medium" height="h-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonBase key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <SkeletonText lines={1} width="medium" height="h-6" />
          <div className="space-y-6 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <SkeletonText lines={1} width="small" height="h-5" />
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex justify-between items-center">
                    <SkeletonText lines={2} width="large" height="h-4" />
                    <SkeletonBase className="w-12 h-6 rounded-full" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Add a user by school email, then assign a default role and
              fine-tune permissions.
            </p>
          </div>
          {/* <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
            <Shield className="w-4 h-4" />
            MFA required for MIS access (NFR11)
          </div> */}
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          User Details
        </h2>
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student.name@school.edu"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
              />
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              This email will be validated against Google SSO records during
              onboarding.
            </p>
          </div>
        </div>
      </div>

      {/* Role Selection and Permissions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Selection Card */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4 bg-[#E9F0FF] p-3 rounded-lg -mx-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Select Default Role
            </h2>
            <span className="text-sm text-gray-500">{ROLES.length} roles</span>
          </div>
          <div className="space-y-2">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedRole === role.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedRole === role.id
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedRole === role.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{role.name}</div>
                    <div className="text-sm text-gray-500">
                      {role.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions Card */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {Object.entries(PERMISSIONS).map(([key, category]) => (
              <div key={key}>
                {/* Category Header */}
                <div
                  className="flex items-center justify-between mb-3 p-3 rounded-lg"
                  style={{ backgroundColor: "#E9F0FF" }}
                >
                  <div>
                    <span className="font-medium text-gray-800">
                      {category.title}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {category.description}
                    </span>
                  </div>
                  {category.type && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        category.type === "Restricted"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {category.type}
                    </span>
                  )}
                </div>

                {/* Permission Items */}
                <div className="space-y-3 ml-4">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <div className="font-medium text-gray-700">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.description}
                        </div>
                      </div>
                      <button
                        onClick={() => handlePermissionToggle(item.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          permissions[item.id] ? "bg-blue-500" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                            permissions[item.id]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            These changes will add the user to the system and apply the selected
            role and permissions.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleCancel}
              className="flex-1 sm:flex-none px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddUser}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Confirm User Addition
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                You are about to add the following user to the system:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium text-gray-800">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Role:</span>
                  <span className="font-medium text-gray-800">
                    {currentRoleName}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                The user will receive access based on the selected role and
                permissions.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {isSubmitting ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
