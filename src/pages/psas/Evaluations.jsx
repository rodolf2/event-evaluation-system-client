import { useState, useEffect, useRef } from "react";
import PSASLayout from "../../components/psas/PSASLayout";
import { Plus, Upload, Search, Filter, ChevronLeft, MoreVertical, Trash2, Star, ChevronsDownUp, AlignLeft, Calendar, RotateCcw, RotateCw, UserPlus, Copy, ChevronDown } from "lucide-react";
import uploadIcon from "../../assets/icons/upload-icon.svg";
import blankFormIcon from "../../assets/icons/blankform-icon.svg";

// Emoji Icons
import E1 from "../../assets/icons/emojis/E1.svg";
import E2 from "../../assets/icons/emojis/E2.svg";
import E3 from "../../assets/icons/emojis/E3.svg";
import E4 from "../../assets/icons/emojis/E4.svg";
import E5 from "../../assets/icons/emojis/E5.svg";
import H1 from "../../assets/icons/emojis/H1.svg";
import H2 from "../../assets/icons/emojis/H2.svg";
import H3 from "../../assets/icons/emojis/H3.svg";
import H4 from "../../assets/icons/emojis/H4.svg";
import H5 from "../../assets/icons/emojis/H5.svg";
import S1 from "../../assets/icons/emojis/S1.svg";
import S2 from "../../assets/icons/emojis/S2.svg";
import S3 from "../../assets/icons/emojis/S3.svg";
import S4 from "../../assets/icons/emojis/S4.svg";
import S5 from "../../assets/icons/emojis/S5.svg";



const Evaluations = () => {
  const [view, setView] = useState("dashboard"); // 'dashboard' or 'create'
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");

  const evaluationForms = [
    { id: 1, title: "Untitled Form", description: "Form Description", status: "Draft", createdAt: "2025-01-15", responses: 0 },
    { id: 2, title: "Untitled Form", description: "Form Description", status: "Published", createdAt: "2025-01-14", responses: 25 },
    { id: 3, title: "Untitled Form", description: "Form Description", status: "Draft", createdAt: "2025-01-13", responses: 0 },
    { id: 4, title: "Untitled Form", description: "Form Description", status: "Published", createdAt: "2025-01-12", responses: 150 },
  ];

  const FormCreationInterface = () => {
    const [questions, setQuestions] = useState([]);
    const [sections, setSections] = useState([]);
    const [showMenu, setShowMenu] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [isCertificateLinked, setIsCertificateLinked] = useState(false);
    const [showCertificateModal, setShowCertificateModal] = useState(false);

    const addQuestion = (sectionId = null) => {
      const newQuestion = {
        id: Date.now(),
        type: "Multiple Choices",
        title: "",
        options: ["Option 1"],
        ratingScale: 5,
        emojiStyle: 'Default',
        required: false,
      };

      if (sectionId) {
        setSections(
          sections.map((section) =>
            section.id === sectionId
              ? { ...section, questions: [...section.questions, newQuestion] }
              : section
          )
        );
      } else {
        setQuestions([...questions, newQuestion]);
      }
    };

    const addSection = () => {
      const newId = sections.length > 0 ? Math.max(...sections.map((s) => s.id)) + 1 : 1;
      setSections([
        ...sections,
        { id: newId, title: "Untitled Section", description: "Add a description", questions: [] },
      ]);
    };

    const updateQuestion = (questionId, updateFn) => {
      setQuestions(questions.map(q => q.id === questionId ? updateFn(q) : q));
      setSections(sections.map(s => ({
        ...s,
        questions: s.questions.map(q => q.id === questionId ? updateFn(q) : q),
      })));
    };

    const updateQuestionType = (id, type) => {
      updateQuestion(id, (q) => ({ ...q, type, options: ["Option 1"], ratingScale: 5, emojiStyle: 'Default' }));
    };
    
    const removeQuestion = (id) => {
      setQuestions(questions.filter(q => q.id !== id));
      setSections(sections.map(s => ({ ...s, questions: s.questions.filter(q => q.id !== id) })));
    };

    const Section = ({ id, title, description }) => {
      const [showMenu, setShowMenu] = useState(false);
      
      const removeSection = (id) => {
        setSections(sections.filter(s => s.id !== id));
      };

      return (
        <div className="relative mt-8">
            <div className="relative top-6 left-0 z-10">
                <span className="px-4 py-1 text-sm text-white bg-blue-600 rounded-t-md">New Section</span>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-10 mt-6 mb-6 relative min-h-[220px]">
                <div className="absolute top-4 right-4">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-gray-100">
                        <MoreVertical size={20} />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border">
                            <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Star size={16} className="mr-3" /> Star
                            </a>
                            <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <ChevronsDownUp size={16} className="mr-3" /> Move to folder
                            </a>
                        </div>
                    )}
                </div>
                <input
                    type="text"
                    defaultValue={title}
                    className="text-3xl sm:text-5xl font-bold w-full border-none outline-none mb-4"
                />
                <textarea
                    placeholder={description}
                    className="w-full text-base sm:text-lg text-gray-600 border-none outline-none resize-none"
                    rows={1}
                ></textarea>
                <div className="absolute bottom-4 right-4">
                  <button onClick={() => removeSection(id)} className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-gray-100">
                      <Trash2 size={20} />
                  </button>
                </div>
            </div>
        </div>
      );
    };

    const emojiStyles = {
      'Default': [E1, E2, E3, E4, E5],
      'Heart': [H1, H2, H3, H4, H5],
      'Star': [S1, S2, S3, S4, S5],
    };

    const Question = ({ id, type, title, options, required, ratingScale, emojiStyle }) => {
      const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
      const styleDropdownRef = useRef(null);

      useEffect(() => {
        const handleClickOutside = (event) => {
          if (styleDropdownRef.current && !styleDropdownRef.current.contains(event.target)) {
            setIsStyleDropdownOpen(false);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [styleDropdownRef]);

      const addOption = () => {
        updateQuestion(id, (q) => ({
          ...q,
          options: [...q.options, `Option ${q.options.length + 1}`],
        }));
      };

      const duplicateQuestion = () => {
        const allQuestions = [...questions, ...sections.flatMap(s => s.questions)];
        const questionToDuplicate = allQuestions.find(q => q.id === id);
        if (questionToDuplicate) {
          const newQuestion = { ...questionToDuplicate, id: Date.now() };
          setQuestions(prev => [...prev, newQuestion]);
        }
      };

      const renderOptions = () => {
        switch (type) {
          case "Numeric Ratings":
            const getNumbersToShow = (scale) => {
              if (scale === 3) return [1, 3, 5];
              if (scale === 4) return [1, 2, 4, 5];
              return [1, 2, 3, 4, 5]; // Default for scale === 5
            };
            const numbersToShow = getNumbersToShow(ratingScale);

            return (
              <div className="mt-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
                  <select
                    value={ratingScale}
                    onChange={(e) => updateQuestion(id, q => ({ ...q, ratingScale: parseInt(e.target.value) }))}
                    className="p-2 border border-gray-300 rounded-md"
                  >
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                  <div className="relative" ref={styleDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
                      className="flex items-center p-2 border border-gray-300 rounded-md"
                    >
                      <img src={emojiStyles[emojiStyle][4]} alt={emojiStyle} className="w-6 h-6" />
                      <ChevronDown size={16} className="ml-2 text-gray-500" />
                    </button>
                    {isStyleDropdownOpen && (
                      <div className="absolute top-full mt-1 w-auto bg-white border border-gray-300 rounded-md shadow-lg z-20">
                        <div className="flex flex-col p-1">
                          {Object.keys(emojiStyles).map(style => (
                            <button
                              key={style}
                              type="button"
                              onClick={() => {
                                updateQuestion(id, q => ({ ...q, emojiStyle: style }));
                                setIsStyleDropdownOpen(false);
                              }}
                              className="p-2 rounded-md hover:bg-gray-100"
                            >
                              <img src={emojiStyles[style][4]} alt={style} className="w-10 h-10" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-center items-center text-center gap-x-2 sm:gap-x-4">
                  {numbersToShow.map(num => (
                    <div key={num} className="flex flex-col items-center">
                      <span>{num}</span>
                      <img src={emojiStyles[emojiStyle][num - 1]} alt={`Rating ${num}`} className="w-10 h-10 sm:w-12 h-12 mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            );
          case "Multiple Choices":
            return (
              <div className="mt-4">
                {options.map((opt, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input type="radio" name={`question-${id}`} className="mr-3 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                    <input
                      type="text"
                      defaultValue={opt}
                      className="flex-grow p-2 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                ))}
                <button onClick={addOption} className="text-blue-600 mt-2 text-sm">Add option</button>
              </div>
            );
          case "Likert Scale":
            return <p className="text-gray-500 mt-4">Likert scale options will be displayed here.</p>;
          case "Paragraph":
            return <textarea className="w-full mt-4 p-2 bg-gray-50 border-b-2 border-dashed border-gray-300" placeholder="Long-answer text"></textarea>;
          default:
            return null;
        }
      };

      return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-start gap-2 mb-4">
            <input
              type="text"
              placeholder="Question"
              defaultValue={title}
              className="text-base flex-grow p-2 bg-gray-50 rounded-md focus:border-blue-500 outline-none"
            />
            <select
              value={type}
              onChange={(e) => updateQuestionType(id, e.target.value)}
              className="ml-0 sm:ml-4 p-2 border border-gray-300 rounded-md"
            >
              <option>Numeric Ratings</option>
              <option>Multiple Choices</option>
              <option>Likert Scale</option>
              <option>Paragraph</option>
            </select>
          </div>
          {renderOptions()}
          <div className="flex justify-end items-center mt-6 pt-4 border-t border-gray-100">
              <button onClick={duplicateQuestion} className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100">
                  <Copy size={20} />
              </button>
              <button onClick={() => removeQuestion(id)} className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-gray-100">
                  <Trash2 size={20} />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              <span className="text-sm text-gray-600 mr-3">Required</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={required} 
                  onChange={() => updateQuestion(id, q => ({ ...q, required: !q.required }))}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
          </div>
        </div>
      );
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                                        <div className="flex items-center">
                                            <button onClick={() => setView('dashboard')} className="text-gray-700 hover:text-black mr-4">
                                                <ChevronLeft size={24} />
                                            </button>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                                                {!selectedDate && (
                                                    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                                        Pick a date
                                                    </span>
                                                )}
                                                <input 
                                                    type="date" 
                                                    value={selectedDate}
                                                    onChange={(e) => setSelectedDate(e.target.value)}
                                                    className={`pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full sm:w-48 ${!selectedDate ? 'text-transparent' : 'text-gray-800'}`} 
                                                />
                                            </div>
                                        </div>                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"><RotateCcw className="w-5 h-5" /></button>
                        <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"><RotateCw className="w-5 h-5" /></button>
                        <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"><UserPlus className="w-5 h-5" /></button>
                        <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">Publish</button>
                    </div>
                </div>

                {/* Form Body */}
                <div className="flex flex-col md:flex-row justify-center relative">
                    <div className="w-full max-w-4xl">
                        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-10 mb-6 relative min-h-[220px]">
                            <div className="absolute top-4 right-4">
                                <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-gray-100">
                                    <MoreVertical size={20} />
                                </button>
                                {showMenu && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border">
                                        <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <Star size={16} className="mr-3" /> Star
                                        </a>
                                        <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <ChevronsDownUp size={16} className="mr-3" /> Move to folder
                                        </a>
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                defaultValue="Untitled Form"
                                className="text-3xl sm:text-5xl font-bold w-full border-none outline-none mb-4"
                            />
                            <textarea
                                placeholder="Add a description"
                                className="w-full text-base sm:text-lg text-gray-600 border-none outline-none resize-none"
                                rows={1}
                            ></textarea>
                        </div>
                        {questions.map((q) => (
                            <Question key={q.id} {...q} />
                        ))}
                    </div>
                    <div className="mt-4 md:ml-6 md:mt-0 hidden md:flex flex-col gap-2">
                        <div className="bg-white rounded-lg shadow-sm p-2 border flex flex-col gap-2">
                            <button onClick={() => addQuestion()} className="p-3 hover:bg-gray-200 rounded-full">
                                <Plus size={20} className="text-gray-700" />
                            </button>
                            <button onClick={addSection} className="p-3 hover:bg-gray-200 rounded-full">
                                <AlignLeft size={20} className="text-gray-700" />
                            </button>
                        </div>
                    </div>
                </div>
                {sections.map((s) => (
                    <div className="flex flex-col md:flex-row justify-center relative" key={s.id}>
                        <div className="w-full max-w-4xl">
                            <Section {...s} />
                            {s.questions.map((q) => (
                                <Question key={q.id} {...q} />
                            ))}
                        </div>
                        <div className="mt-4 md:ml-6 md:mt-14 hidden md:flex flex-col gap-2">
                            <div className="bg-white rounded-lg shadow-sm p-2 border flex flex-col gap-2">
                                <button onClick={() => addQuestion(s.id)} className="p-3 hover:bg-gray-200 rounded-full">
                                    <Plus size={20} className="text-gray-700" />
                                </button>
                                <button onClick={addSection} className="p-3 hover:bg-gray-200 rounded-full">
                                    <AlignLeft size={20} className="text-gray-700" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Link Certificate Button */}
            <div className="flex justify-center py-8 bg-gray-100">
                <button
                    onClick={() => setShowCertificateModal(true)}
                    className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                        isCertificateLinked ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 hover:bg-gray-600'
                    }`}
                >
                    Link Certificate
                </button>
            </div>

            {/* FAB for Mobile */}
            <div className="md:hidden fixed bottom-6 right-6 z-30">
                {isFabOpen && (
                    <div className="flex flex-col items-center gap-3 mb-3">
                        <button onClick={() => { addSection(); setIsFabOpen(false); }} className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center">
                            <AlignLeft size={24} className="text-gray-700" />
                        </button>
                        <button onClick={() => { addQuestion(); setIsFabOpen(false); }} className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center">
                            <Plus size={24} className="text-gray-700" />
                        </button>
                    </div>
                )}
                <button onClick={() => setIsFabOpen(!isFabOpen)} className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center">
                    <Plus size={32} className={`transition-transform duration-300 ${isFabOpen ? 'rotate-45' : 'rotate-0'}`} />
                </button>
            </div>

            {/* Certificate Modal */}
            {showCertificateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
                        <h2 className="text-2xl font-bold mb-4">Choose a Certificate Template</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div
                                    key={i}
                                    onClick={() => {
                                        setIsCertificateLinked(true);
                                        setShowCertificateModal(false);
                                    }}
                                    className="border rounded-lg p-4 text-center hover:shadow-lg hover:border-blue-500 cursor-pointer"
                                >
                                    <div className="bg-gray-200 h-32 flex items-center justify-center rounded-md">
                                        <p className="text-gray-500">Template {i}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowCertificateModal(false)}
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  };

  // Main evaluation content component (Dashboard)
  const EvaluationContent = () => (
    <div className="p-6 md:p-5 bg-gray-50 flex flex-col">
      <div className="flex-shrink-0">
        <h2 className="text-3xl text-gray-800 mb-4">Start an evaluation</h2>
        <div className="mb-7">
          <div
            className="mb-8 text-white p-8 rounded-xl shadow-lg"
            style={{ background: "linear-gradient(-0.15deg, #324BA3 38%, #002474 100%)" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-10xl mx-auto">
              <div
                className="bg-white rounded-xl shadow-lg p-8 sm:p-16 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => setView("create")}
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center mx-auto mb-4">
                  <img src={blankFormIcon} alt="Blank Form" className="w-10 h-10 sm:w-16 sm:h-16" />
                </div>
              </div>
              <div
                className="bg-white rounded-xl shadow-lg p-8 sm:p-16 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => setShowUploadModal(true)}
              >
                <div className="w-24 h-24 sm:w-30 sm:h-32 flex items-center justify-center mx-auto mb-4">
                  <img src={uploadIcon} alt="Upload" className="w-10 h-10 sm:w-16 sm:h-16" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-10xl mx-auto mt-5">
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Blank Form</h3>
              </div>
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Upload Form</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Recent Evaluations</h2>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
              <div className="flex-1 relative">
                <Search className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search evaluations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <Filter className="w-6 h-6 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="title">Title A-Z</option>
                  <option value="responses">Most Responses</option>
                </select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
            {evaluationForms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-xl shadow-lg p-3 sm:p-4 cursor-pointer duration-300 min-h-[200px] sm:min-h-[180px]"
                style={{ background: "linear-gradient(-0.15deg, #324BA3 38%, #002474 100%)" }}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm sm:text-base">F</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                      form.status === "Published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {form.status}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base truncate">{form.title}</h3>
                <p className="text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">{form.description}</p>
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                  <span className="font-medium">{form.responses} responses</span>
                  <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PSASLayout>
        {view === 'create' ? <FormCreationInterface /> : <EvaluationContent />}
        {showUploadModal && view === 'dashboard' && (
          <div className="fixed inset-0 bg-[#F4F4F5]/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Upload Form</h3>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Add link or File URL"
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setShowUploadModal(false); setUploadUrl(""); }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { console.log("Uploading:", uploadUrl); setShowUploadModal(false); setUploadUrl(""); }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}
      </PSASLayout>
    </>
  );
};

export default Evaluations;
