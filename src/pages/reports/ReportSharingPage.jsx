import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react";
import PSASLayout from "../../components/psas/PSASLayout";
import { useAuth } from "../../contexts/useAuth";
import api from "../../api";
import toast from "react-hot-toast";

// API endpoints constants
const API_ENDPOINTS = {
  PERSONNEL: "/api/personnel",
  REPORT_SHARE: (reportId) => `/api/reports/${reportId}/share`,
};

const ReportSharingPage = () => {
  console.log("🚀 ReportSharingPage component is rendering!");
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [selected, setSelected] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const [personnel, setPersonnel] = useState([]);
  const [loadingPersonnel, setLoadingPersonnel] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
  });
  const [newPerson, setNewPerson] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load personnel from API (school-admin role)
  useEffect(() => {
    let mounted = true;

    const fetchPersonnel = async () => {
      try {
        setLoadingPersonnel(true);
        const res = await api.get(
          `${API_ENDPOINTS.PERSONNEL}?limit=500&sortBy=name&sortOrder=asc`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (mounted) {
          // Normalize personnel data to use consistent ID field
          const apiData = res.data?.personnel || [];

          const normalizedPersonnel = apiData.map((p) => ({
            ...p,
            id: p._id || p.id, // Ensure we have a consistent id field
          }));

          setPersonnel(normalizedPersonnel);
        }
      } catch (error) {
        console.error("Error fetching personnel:", error);
        if (mounted) {
          toast.error(
            error.response?.data?.message || "Unable to load personnel"
          );
        }
      } finally {
        if (mounted) {
          setLoadingPersonnel(false);
        }
      }
    };

    fetchPersonnel();

    return () => {
      mounted = false;
    };
  }, []);

  // Get reportId/eventId from location state or URL params
  const reportId =
    location.state?.reportId ||
    location.state?.eventId ||
    new URLSearchParams(location.search).get("reportId");

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allFilteredIds = filteredPersonnel.map((p) => p.id);
      setSelected(allFilteredIds);
    } else {
      setSelected([]);
    }
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate rows per page selection
  const validateRowsPerPage = (value) => {
    const numValue = Number(value);
    return !isNaN(numValue) && numValue > 0 && numValue <= 100;
  };

  const handleDone = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one school administrator");
      return;
    }

    if (!reportId) {
      toast.error("Report ID not found");
      navigate(-1);
      return;
    }

    // Get full personnel details for selected IDs
    const selectedPersonnel = personnel.filter((p) => selected.includes(p.id));

    try {
      setIsSharing(true);

      // Call API to share report
      await api.post(
        API_ENDPOINTS.REPORT_SHARE(reportId),
        {
          schoolAdmins: selectedPersonnel.map((p) => ({
            personnelId: p.id,
            name: p.name,
            email: p.email,
            department: p.department,
            position: p.position,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(
        `Report shared with ${selected.length} school administrator(s)`
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
    return [
      ...new Set(personnel.map((p) => p.department).filter(Boolean)),
    ].sort();
  }, [personnel]);

  const filteredPersonnel = useMemo(() => {
    return personnel.filter((person) => {
      const matchesSearch =
        !searchQuery ||
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.position.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment =
        !departmentFilter || person.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [personnel, searchQuery, departmentFilter]);

  const totalPages = Math.ceil(filteredPersonnel.length / rowsPerPage);
  const paginatedPersonnel = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const result = filteredPersonnel.slice(startIndex, endIndex);
    console.log("Paginated Personnel:", result); // Debug: Log paginated data
    console.log("Loading state:", loadingPersonnel); // Debug: Log loading state
    console.log("Filtered count:", filteredPersonnel.length); // Debug: Log filtered count
    return result;
  }, [filteredPersonnel, currentPage, rowsPerPage]);

  const resetEdit = () => {
    setEditingId(null);
    setEditDraft({ name: "", email: "", department: "", position: "" });
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!newPerson.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!newPerson.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!isValidEmail(newPerson.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsAdding(true);
      const res = await api.post(
        API_ENDPOINTS.PERSONNEL,
        { ...newPerson },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Standardize success check logic
      if (res.success !== false) {
        toast.success("Personnel added");
        // Normalize the new personnel data
        const normalizedPersonnel = {
          ...res.data.personnel,
          id: res.data.personnel._id || res.data.personnel.id,
        };
        setPersonnel((prev) => [...prev, normalizedPersonnel]);
        setNewPerson({ name: "", email: "", department: "", position: "" });
      } else {
        toast.error(res.message || "Failed to add personnel");
      }
    } catch (error) {
      console.error("Add personnel error:", error);
      toast.error(error.response?.data?.message || "Failed to add personnel");
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditSave = async (personId) => {
    // Validate inputs
    if (!editDraft.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!editDraft.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!isValidEmail(editDraft.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsEditing(true);
      const res = await api.put(
        `${API_ENDPOINTS.PERSONNEL}/${personId}`,
        { ...editDraft },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Standardize success check logic
      if (res.success !== false) {
        toast.success("Personnel updated");
        setPersonnel((prev) =>
          prev.map((p) => (p.id === personId ? { ...p, ...editDraft } : p))
        );
        resetEdit();
      } else {
        toast.error(res.message || "Failed to update personnel");
      }
    } catch (error) {
      console.error("Update personnel error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update personnel"
      );
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (personId) => {
    if (!window.confirm("Delete this personnel?")) return;
    try {
      setIsDeleting(true);
      await api.delete(`${API_ENDPOINTS.PERSONNEL}/${personId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Personnel deleted");
      setPersonnel((prev) => prev.filter((p) => p.id !== personId));
      setSelected((prev) => prev.filter((id) => id !== personId));
    } catch (error) {
      console.error("Delete personnel error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete personnel"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PSASLayout>
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

        {/* Add Personnel Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-[#F4F4F5]/60 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Personnel
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={newPerson.name}
                    onChange={(e) =>
                      setNewPerson((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={newPerson.email}
                    onChange={(e) =>
                      setNewPerson((p) => ({ ...p, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="Enter department"
                    value={newPerson.department}
                    onChange={(e) =>
                      setNewPerson((p) => ({
                        ...p,
                        department: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    placeholder="Enter position"
                    value={newPerson.position}
                    onChange={(e) =>
                      setNewPerson((p) => ({ ...p, position: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding || loadingPersonnel}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isAdding ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding...
                      </>
                    ) : (
                      "Add Personnel"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Personnel Button */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Manage Personnel
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              aria-label="Add new personnel"
            >
              <Plus className="w-5 h-5" />
              Add Personnel
            </button>
          </div>
        </div>

        {/* Personnel Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid items-center p-3 bg-gray-200 border-b border-gray-300 grid-cols-[auto_1.5fr_2.5fr_2fr_2fr] gap-x-4">
            <input
              type="checkbox"
              checked={
                selected.length > 0 &&
                selected.length === filteredPersonnel.length
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
            {loadingPersonnel ? (
              <div className="p-8 text-center text-gray-500">
                Loading... (personnel: {personnel.length}, filtered:{" "}
                {filteredPersonnel.length}, paginated:{" "}
                {paginatedPersonnel.length})
              </div>
            ) : paginatedPersonnel.length > 0 ? (
              paginatedPersonnel.map((person) => {
                const personId = person.id;
                const isRowEditing = editingId === personId;
                return (
                  <div
                    key={personId}
                    onClick={() => handleSelect(personId)}
                    className="grid items-center p-3 border-t border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer
                              grid-cols-[auto_1fr] md:grid-cols-[auto_1.5fr_2.5fr_2fr_2fr_auto] gap-x-4 gap-y-1"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(personId)}
                      onChange={() => handleSelect(personId)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 mt-1 md:mt-0"
                    />

                    <div className="md:hidden flex flex-col">
                      {editingId === personId ? (
                        <>
                          <input
                            className="border rounded px-2 py-1 mb-1"
                            value={editDraft.name}
                            onChange={(e) =>
                              setEditDraft((d) => ({
                                ...d,
                                name: e.target.value,
                              }))
                            }
                          />
                          <input
                            className="border rounded px-2 py-1 mb-1"
                            value={editDraft.email}
                            onChange={(e) =>
                              setEditDraft((d) => ({
                                ...d,
                                email: e.target.value,
                              }))
                            }
                          />
                          <input
                            className="border rounded px-2 py-1 mb-1"
                            value={editDraft.department}
                            onChange={(e) =>
                              setEditDraft((d) => ({
                                ...d,
                                department: e.target.value,
                              }))
                            }
                          />
                          <input
                            className="border rounded px-2 py-1"
                            value={editDraft.position}
                            onChange={(e) =>
                              setEditDraft((d) => ({
                                ...d,
                                position: e.target.value,
                              }))
                            }
                          />
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-gray-800">
                            {person.name || "No name"}
                          </span>
                          <span className="text-sm text-gray-600 break-all">
                            Email: {person.email}
                          </span>
                          <span className="text-sm text-gray-600">
                            Department: {person.department}
                          </span>
                          <span className="text-sm text-gray-600">
                            Position: {person.position}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="hidden md:block">
                      {isRowEditing ? (
                        <input
                          className="w-full border rounded px-2 py-1"
                          value={editDraft.name}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              name: e.target.value,
                            }))
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="font-medium text-gray-800">
                          {person.name || "No name"}
                        </span>
                      )}
                    </div>
                    <div className="hidden md:block">
                      {isRowEditing ? (
                        <input
                          className="w-full border rounded px-2 py-1"
                          value={editDraft.email}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              email: e.target.value,
                            }))
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-gray-600 break-all">
                          {person.email}
                        </span>
                      )}
                    </div>
                    <div className="hidden md:block">
                      {isRowEditing ? (
                        <input
                          className="w-full border rounded px-2 py-1"
                          value={editDraft.department}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              department: e.target.value,
                            }))
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-gray-600">
                          {person.department}
                        </span>
                      )}
                    </div>
                    <div className="hidden md:block">
                      {isRowEditing ? (
                        <input
                          className="w-full border rounded px-2 py-1"
                          value={editDraft.position}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              position: e.target.value,
                            }))
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-gray-600">{person.position}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      {editingId === personId ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSave(personId);
                            }}
                            disabled={isEditing}
                            className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Save changes"
                          >
                            {isEditing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                Save
                              </>
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              resetEdit();
                            }}
                            className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:bg-gray-50 rounded"
                            aria-label="Cancel editing"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(personId);
                              setEditDraft({
                                name: person.name || "",
                                email: person.email || "",
                                department: person.department || "",
                                position: person.position || "",
                              });
                            }}
                            className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                            aria-label={`Edit ${person.name}`}
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(personId);
                            }}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Delete ${person.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500">
                No personnel match your search criteria.
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
              out of {filteredPersonnel.length} rows
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
    </PSASLayout>
  );
};

export default ReportSharingPage;
