import { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
} from "lucide-react";
import PSASLayout from "../../components/psas/PSASLayout";

const StudentItem = ({ student, isSelected, onSelect }) => {
  return (
    <div
      className="grid items-center p-3 border-t border-gray-200 hover:bg-gray-100 transition-colors
                grid-cols-[auto_1fr] md:grid-cols-[auto_1.5fr_2.5fr_1.5fr_1.5fr_0.5fr] gap-x-4 gap-y-1"
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(student.id)}
        className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 mt-1 md:mt-0"
      />
      {/* Mobile View: Stacked details */}
      <div className="md:hidden flex flex-col">
        <span className="font-medium text-gray-800">
          {student.name || "N/A"}
        </span>
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
        <span className="font-medium text-gray-800">
          {student.name || "N/A"}
        </span>
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

  useEffect(() => {
    const csvData = sessionStorage.getItem("csvData");
    if (csvData) {
      try {
        const parsedData = JSON.parse(csvData);
        // Add IDs to students for selection
        const studentsWithIds = parsedData.students.map((student, index) => ({
          ...student,
          id: index + 1,
        }));
        setStudents(studentsWithIds);
      } catch (error) {
        console.error("Error parsing CSV data:", error);
      }
    }
    setLoading(false);
  }, []);

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(paginatedStudents.map((s) => s.id));
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
    selected.length > 0 && selected.length === paginatedStudents.length;

  const handleDoneClick = async () => {
    const formId = sessionStorage.getItem("uploadedFormId") || sessionStorage.getItem("editFormId");
    if (!formId) {
      alert("Error: Form ID not found in session storage. Cannot generate certificates.");
      return;
    }

    if (selected.length === 0) {
      alert("Please select at least one student to generate certificates.");
      return;
    }

    try {
      // Assuming selected contains student IDs which are now userIds
      const participantIds = selected;

      const response = await fetch('/api/certificates/generate-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Add authorization token if required
          // 'Authorization': `Bearer ${yourAuthToken}`,
        },
        body: JSON.stringify({
          eventId: formId, // Using formId as eventId for certificate generation
          participantIds: participantIds,
          certificateType: 'participation', // Default type, can be made dynamic
          sendEmail: false // Can be made dynamic
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`Successfully generated ${result.data.filter(r => r.success).length} certificates.`);
        // Optionally, clear selected students or navigate away
        setSelected([]);
      } else {
        alert(`Failed to generate certificates: ${result.message || result.error}`);
      }
    } catch (error) {
      console.error("Error generating bulk certificates:", error);
      alert("An error occurred while generating certificates.");
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
                      <button className="p-2 rounded-full hover:bg-gray-200"><Download className="w-5 h-5" /></button>
                                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" onClick={handleDoneClick}>Done</button>
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
                {students.length === 0
                  ? "No students data found. Please upload a CSV first."
                  : "No students match your search criteria."}
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
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-blue-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Only show a limited number of page buttons around the current page
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPage === pageNum ? 'bg-blue-800 text-white' : 'bg-gray-200 text-blue-800 hover:bg-gray-300'}`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                  return <span key={pageNum} className="w-8 h-8 flex items-center justify-center text-blue-800">...</span>;
                }
                return null;
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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

export default StudentList;
