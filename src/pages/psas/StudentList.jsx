import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  ArrowLeft,
  Plus,
} from "lucide-react";
import PSASLayout from "../../components/psas/PSASLayout";
import ImportCSVModal from "../../components/psas/evaluations/ImportCSVModal";
import { FormSessionManager } from "../../utils/formSessionManager";

const StudentItem = ({ student, isSelected, onSelect }) => {
  const studentName =
    student.name || student["full name"] || student["student name"] || "N/A";

  return (
    <div
      onClick={() => onSelect(student.id)}
      className="grid items-center p-3 border-t border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer
                grid-cols-[auto_1fr] md:grid-cols-[auto_1.5fr_2.5fr_1.5fr_1.5fr_0.5fr] gap-x-4 gap-y-1"
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(student.id)}
        onClick={(e) => e.stopPropagation()}
        className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 mt-1 md:mt-0"
      />
      {/* Mobile View: Stacked details */}
      <div className="md:hidden flex flex-col">
        <span className="font-medium text-gray-800">{studentName}</span>
        <span className="text-gray-600 break-all">
          Email: {student.email || "N/A"}
        </span>
        <span className="text-gray-600">
          Department: {student.department || "N/A"}
        </span>
        <span className="text-gray-600">
          Program: {student.program || "N/A"}
        </span>
        <span className="text-gray-600">Year: {student.year || "N/A"}</span>
      </div>

      {/* Desktop View: Grid columns */}
      <div className="hidden md:block">
        <span className="font-medium text-gray-800">{studentName}</span>
      </div>
      <div className="hidden md:block">
        <span className="text-gray-600 break-all">
          {student.email || "N/A"}
        </span>
      </div>
      <div className="hidden md:block">
        <span className="text-gray-600">{student.department || "N/A"}</span>
      </div>
      <div className="hidden md:block">
        <span className="text-gray-600">{student.program || "N/A"}</span>
      </div>
      <div className="hidden md:block text-right text-gray-600">
        {student.year || "N/A"}
      </div>
    </div>
  );
};

const StudentList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [showImportModal, setShowImportModal] = useState(false);

  // Handle CSV upload from ImportCSVModal:
  // For the "View" flow, ImportCSVModal already navigates here with a formId.
  // We do not persist CSV; we only expect server-side or session-backed recipients.
  const handleCSVUpload = () => {
    setShowImportModal(false);
  };

  // Clear and restore student selection state - start fresh each time
  useEffect(() => {
    // Clear any previous selection to start fresh
    localStorage.removeItem("studentSelection");
    setSelected([]);
  }, []);

  const handleBackClick = () => {
    // Get form ID from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const formIdFromUrl = urlParams.get("formId");
    const isNewForm = urlParams.get("newForm") === "true";

    if (formIdFromUrl) {
      // Navigate to form creation interface with edit parameter
      navigate(`/psas/evaluations?edit=${formIdFromUrl}`);
    } else if (isNewForm) {
      // Navigate to form creation interface for new form
      navigate("/psas/evaluations?view=create");
    } else {
      // Fallback to form creation interface without edit parameter
      navigate("/psas/evaluations");
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const formIdFromUrl = urlParams.get("formId");

    if (!formIdFromUrl) {
      setLoading(false);
      return;
    }

    // Use unified ID management to ensure persistent form ID
    FormSessionManager.ensurePersistentFormId(formIdFromUrl);

    // Try to load transient CSV data from session
    const transientCSV = FormSessionManager.loadTransientCSVData();
    if (transientCSV && Array.isArray(transientCSV.students)) {
      const studentsWithIds = transientCSV.students.map((student, index) => {
        // Normalize email to ensure consistency with server-side processing
        const normalizedEmail = student.email
          ? student.email.toLowerCase().trim()
          : "";
        return {
          ...student,
          email: normalizedEmail, // Use normalized email
          // Use normalized email as stable ID to ensure consistency across page reloads
          id: normalizedEmail || `student_${index + 1}`,
        };
      });
      setStudents(studentsWithIds);
      setLoading(false);
      return;
    }
  }, [location.search]);

  const handleSelect = (id) => {
    setSelected((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      return newSelection;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select all filtered students across all pages
      const allFilteredIds = filteredStudents.map((s) => s.id);
      setSelected(allFilteredIds);
    } else {
      setSelected([]);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        !searchQuery ||
        (student.name &&
          student.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (student.email &&
          student.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDepartment =
        !departmentFilter || student.department === departmentFilter;
      const matchesProgram =
        !programFilter || student.program === programFilter;
      const matchesYear = !yearFilter || student.year === yearFilter;

      // Always show all students - filtering is only for search/department/program/year
      // Selection is handled by checkboxes but doesn't hide students from view
      return (
        matchesSearch && matchesDepartment && matchesProgram && matchesYear
      );
    });
  }, [students, searchQuery, departmentFilter, programFilter, yearFilter]);

  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, currentPage, rowsPerPage]);

  const isAllSelected =
    selected.length > 0 && selected.length === filteredStudents.length;

  const handleDoneClick = () => {
    const urlParams = new URLSearchParams(location.search);
    const formIdFromUrl = urlParams.get("formId");

    if (!formIdFromUrl) {
      alert(
        "Error: Form ID not found. Cannot assign students to form. Please start from the form creation page."
      );
      return;
    }

    if (selected.length === 0) {
      alert("Please select at least one student to receive the form.");
      return;
    }

    try {
      // Debug logging
      console.log("🎯 Assigning students to form:", {
        formIdFromUrl,
        selectedCount: selected.length,
        totalStudents: students.length,
        selectedIds: selected,
      });

      // Get the currently assigned formId from FormSessionManager
      const currentFormId = FormSessionManager.getCurrentFormId();
      console.log("📋 Current FormSessionManager formId:", currentFormId);

      // Use the URL formId if currentFormId doesn't exist, otherwise ensure they're in sync
      const finalFormId = currentFormId || formIdFromUrl;

      // Ensure FormSessionManager has the correct formId
      FormSessionManager.ensurePersistentFormId(finalFormId);

      console.log(
        "🔍 Debug: Available students data structure:",
        students.slice(0, 2)
      );
      console.log("🔍 Debug: Selected IDs:", selected);

      // Filter selected students with proper ID handling - enhanced for bulk operations
      const selectedStudents = students
        .filter((student) => {
          const hasId = student && student.id;
          const isSelected = hasId && selected.includes(student.id);
          console.log(
            `🔍 Student ${student.email || student.name}: id=${
              student.id
            }, selected=${isSelected}`
          );
          return isSelected;
        })
        .map((student) => {
          const processed = {
            ...student,
            // Ensure all required fields are present and normalized
            id: student.id,
            name:
              student.name ||
              student["full name"] ||
              student["student name"] ||
              "Unknown",
            email: student.email || "",
            department: student.department || "",
            program: student.program || "",
            year: student.year || "",
          };
          console.log("✅ Processed student:", processed);
          return processed;
        });

      console.log(
        `✅ Final selected students count: ${selectedStudents.length} out of ${selected.length} requested`
      );

      if (selectedStudents.length === 0) {
        alert(
          "No valid students found in selection. Please check your selection and try again."
        );
        return;
      }

      if (selectedStudents.length < selected.length) {
        console.warn(
          `⚠️ Only ${selectedStudents.length} students processed out of ${selected.length} selected`
        );
      }

      // Save student assignments with debug logging
      const saveResult =
        FormSessionManager.saveStudentAssignments(selectedStudents);
      console.log("💾 Save student assignments result:", saveResult);

      if (!saveResult) {
        console.error("❌ Failed to save student assignments");
        alert("Failed to save student assignments. Please try again.");
        return;
      }

      // Clear local selection state
      setSelected([]);

      // Preserve form ID before navigation
      FormSessionManager.preserveFormId();

      // Navigate back to form creation with recipients count
      const navigationUrl = `/psas/evaluations?recipients=${selectedStudents.length}&formId=${finalFormId}&from=studentList`;
      console.log("🧭 Navigating to:", navigationUrl);

      navigate(navigationUrl);
    } catch (error) {
      console.error("🚨 Error assigning students to form:", error);
      alert(
        `An error occurred while assigning students to the form: ${error.message}`
      );
    }
  };

  // Get unique values for filters
  const departments = [
    ...new Set(students.map((s) => s.department).filter(Boolean)),
  ];
  const programs = [...new Set(students.map((s) => s.program).filter(Boolean))];
  const years = [...new Set(students.map((s) => s.year).filter(Boolean))];

  if (loading) {
    return (
      <PSASLayout>
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PSASLayout>
    );
  }

  return (
    <PSASLayout>
      <div className="p-4 sm:p-6 md:p-8 bg-gray-100 min-h-full">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email"
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
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-gray-200">
              <Download className="w-5 h-5" />
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              onClick={handleDoneClick}
            >
              {selected.length > 0
                ? `Assign ${selected.length} Students`
                : "Assign to Form"}
            </button>
          </div>
        </div>
        {/* Filters */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex flex-col md:flex-row gap-4">
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
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program
              </label>
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Programs</option>
                {programs.map((prog) => (
                  <option key={prog} value={prog}>
                    {prog}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setDepartmentFilter("");
                  setProgramFilter("");
                  setYearFilter("");
                }}
                className="w-full md:w-auto px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Students Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div
            className="hidden md:grid items-center p-3 bg-gray-200 border-b border-gray-300
                      grid-cols-[auto_1.5fr_2.5fr_1.5fr_1.5fr_0.5fr] gap-x-4"
          >
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
              className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <h2 className="text-lg font-semibold text-gray-700">Name</h2>
            <h2 className="text-lg font-semibold text-gray-700">Email</h2>
            <h2 className="text-lg font-semibold text-gray-700">Department</h2>
            <h2 className="text-lg font-semibold text-gray-700">Program</h2>
            <h2 className="text-lg font-semibold text-gray-700 text-right">
              Year
            </h2>
            {selected.length > 0 && (
              <div className="flex items-center gap-4 ml-auto col-span-full">
                <span className="font-semibold text-sm text-gray-600">
                  {selected.length} selected
                </span>
              </div>
            )}
          </div>

          {/* List */}
          <div>
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student) => (
                <StudentItem
                  key={student.id}
                  student={student}
                  isSelected={selected.includes(student.id)}
                  onSelect={handleSelect}
                />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                {students.length === 0 ? (
                  <div className="flex flex-col items-center gap-4">
                    <div>No students data found.</div>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Import CSV File
                    </button>
                  </div>
                ) : (
                  "No students match your search criteria."
                )}
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
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when rows per page changes
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-gray-700">
              out of {filteredStudents.length} rows
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
                // Only show a limited number of page buttons around the current page
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

      {/* Import CSV Modal */}
      <ImportCSVModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onFileUpload={handleCSVUpload}
        uploadedCSVData={null}
      />
    </PSASLayout>
  );
};

export default StudentList;
