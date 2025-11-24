import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import PSASLayout from "../../components/psas/PSASLayout";
import axios from "axios";
import toast from "react-hot-toast";

// Hardcoded personnel data - these are school administrators
const preparedByPersonnel = [
  {
    id: 1,
    name: "Alma Lacerna",
    email: "almalacserna@laverdad.edu.ph",
    department: "Office of the Administrator",
    position: "Secretary to the Administrator",
  },
  {
    id: 2,
    name: "Annabelle Bencosio",
    email: "annabellebencas@laverdad.edu.ph",
    department: "Higher Education",
    position: "BSSW - Program Head",
  },
  {
    id: 3,
    name: "Anne Beverly Soriano",
    email: "annebeverlysoriano@laverdad.edu.ph",
    department: "Registrar and Admissions",
    position: "Department Head",
  },
  {
    id: 4,
    name: "Christine Angeli Adova",
    email: "angeladova@laverdad.edu.ph",
    department: "Compliance",
    position: "Compliance Officer",
  },
  {
    id: 5,
    name: "Daisy Cruz",
    email: "daisycruz@laverdad.edu.ph",
    department: "Quality Assurance",
    position: "Quality Assurance Officer",
  },
  {
    id: 6,
    name: "Elyness Asuncion Belendres",
    email: "elynassasuncion@laverdad.edu.ph",
    department: "Communications",
    position: "Department Head",
  },
  {
    id: 7,
    name: "Eric Bolano",
    email: "ericbolano@laverdad.edu.ph",
    department: "General Services and Security",
    position: "Department Head",
  },
  {
    id: 8,
    name: "Eric Yumul",
    email: "ericyumul@laverdad.edu.ph",
    department: "Higher Education",
    position: "BSA/BSAIS - Program Head",
  },
  {
    id: 9,
    name: "Irish Joye Domiao",
    email: "irishdomioa@laverdad.edu.ph",
    department: "Basic Education",
    position: "Assistant Principal (Primary Department)",
  },
  {
    id: 10,
    name: "Ireagan Domolo Jr",
    email: "iregandonolor@laverdad.edu.ph",
    department: "Management Information System",
    position: "Department Head",
  },
  {
    id: 11,
    name: "Ivy Mae Garcia",
    email: "ivymaegarcia@laverdad.edu.ph",
    department: "Human Resource",
    position: "Department Head",
  },
  {
    id: 12,
    name: "Jade Riel Abuela",
    email: "jaderiel.abu@laverdad.edu.ph",
    department: "Office of the Chancellor",
    position: "Secretary to the Chancellor",
  },
  {
    id: 13,
    name: "Jasmin Yoon",
    email: "jasimyoon@laverdad.edu.ph",
    department: "Library",
    position: "Department Head",
  },
  {
    id: 14,
    name: "Jeremy Damlao",
    email: "jeremydamlao@laverdad.edu.ph",
    department: "Data Privacy",
    position: "Compliance Officer",
  },
  {
    id: 15,
    name: "Jerreck Reynold Navalta",
    email: "jerreckreynoldnavalta@laverdad.edu.ph",
    department: "Higher Education",
    position: "BSIB/ACT - Program Head",
  },
  {
    id: 16,
    name: "Joel Regino",
    email: "joelregino@laverdad.edu.ph",
    department: "Higher Education",
    position: "BAB - Program Head",
  },
  {
    id: 17,
    name: "Lucka Kristine Villanueva",
    email: "luckievillanueva@laverdad.edu.ph",
    department: "Prefect of Student Affairs and Services",
    position: "Department Head",
  },
  {
    id: 18,
    name: "Raquel Blaza",
    email: "raquelblaza@laverdad.edu.ph",
    department: "Finance and Accounting",
    position: "Department Head",
  },
  {
    id: 19,
    name: "Roldan Villanueva",
    email: "roldanvillanueva@laverdad.edu.ph",
    department: "Basic Education",
    position: "Assistant Principal (Senior Department)",
  },
  {
    id: 20,
    name: "Rommel Alba",
    email: "rommelalba@laverdad.edu.ph",
    department: "Basic Education",
    position: "Assistant Principal (Academic Affairs)",
  },
  {
    id: 21,
    name: "Ruperto Gibon Jr",
    email: "rupertogibon@laverdad.edu.ph",
    department: "Basic Education",
    position: "Assistant Principal (Homeschool Department)",
  },
  {
    id: 22,
    name: "Shanece Labung",
    email: "shanecelabung@laverdad.edu.ph",
    department: "Data Privacy and Office of the Chancellor / Administrator",
    position: "Chancellor/Administrator/Assistant Principal",
  },
  {
    id: 23,
    name: "Sheila De Guzman",
    email: "sheiladeguzman@laverdad.edu.ph",
    department: "Basic Education",
    position: "Assistant Principal (Junior Department)",
  },
  {
    id: 24,
    name: "Tito Motocfinos",
    email: "titomotosfinos@laverdad.edu.ph",
    department: "Basic Education",
    position: "Assistant Principal (Intermediate Department)",
  },
  {
    id: 25,
    name: "Willen Anne Alba",
    email: "willenanneelba@laverdad.edu.ph",
    department: "Prefect of Student Affairs and Services",
    position: "Assistant Department Head",
  },
];

const ReportSharingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [selected, setSelected] = useState([]);
  const [isSharing, setIsSharing] = useState(false);

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
    const selectedPersonnel = preparedByPersonnel.filter((p) =>
      selected.includes(p.id)
    );

    try {
      setIsSharing(true);

      // Call API to share report
      const response = await axios.post(`/api/reports/${reportId}/share`, {
        schoolAdmins: selectedPersonnel.map((p) => ({
          personnelId: p.id,
          name: p.name,
          email: p.email,
          department: p.department,
          position: p.position,
        })),
      });

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

  const departments = [
    ...new Set(preparedByPersonnel.map((p) => p.department)),
  ].sort();

  const filteredPersonnel = useMemo(() => {
    return preparedByPersonnel.filter((person) => {
      const matchesSearch =
        !searchQuery ||
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.position.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment =
        !departmentFilter || person.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [searchQuery, departmentFilter]);

  const totalPages = Math.ceil(filteredPersonnel.length / rowsPerPage);
  const paginatedPersonnel = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredPersonnel.slice(startIndex, endIndex);
  }, [filteredPersonnel, currentPage, rowsPerPage]);

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
            {paginatedPersonnel.length > 0 ? (
              paginatedPersonnel.map((person) => (
                <div
                  key={person.id}
                  onClick={() => handleSelect(person.id)}
                  className="grid items-center p-3 border-t border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer
                            grid-cols-[auto_1fr] md:grid-cols-[auto_1.5fr_2.5fr_2fr_2fr] gap-x-4 gap-y-1"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(person.id)}
                    onChange={() => handleSelect(person.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 mt-1 md:mt-0"
                  />

                  <div className="md:hidden flex flex-col">
                    <span className="font-medium text-gray-800">
                      {person.name}
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
                  </div>

                  <div className="hidden md:block">
                    <span className="font-medium text-gray-800">
                      {person.name}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <span className="text-gray-600 break-all">
                      {person.email}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <span className="text-gray-600">{person.department}</span>
                  </div>
                  <div className="hidden md:block">
                    <span className="text-gray-600">{person.position}</span>
                  </div>
                </div>
              ))
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
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
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
