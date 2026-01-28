import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CampusCarousel from "../components/CampusCarousel";
import { ChevronDown, Menu, X } from "lucide-react";

const LandingPage = () => {
  const features = [
    {
      title: "Feedback Collection",
      description:
        "Easily gather attendee insights after each events with intuitive digital surveys.",
      icon: "fi fi-sr-assessment-alt",
    },
    {
      title: "Data-Driven Feedback Analysis",
      description:
        "Analyze event feedback to reveal key trends and provide insights needed to make decisions.",
      icon: "fi fi-br-analyse",
    },
    {
      title: "Event Analytics",
      description:
        "Provides a performance overview of every event, tracking key metrics and overall satisfaction.",
      icon: "fi fi-br-chart-histogram",
    },
    {
      title: "Actionable Insights",
      description:
        "Translate raw data into clear, strategic recommendations for future event planning.",
      icon: "fi fi-br-insight",
    },
    {
      title: "Enhanced Student Engagement",
      description:
        "Foster a culture where every student voice contributes directly to campus improvement.",
      icon: "fi fi-sr-magnet-user",
    },
    {
      title: "Performance Reports",
      description:
        "Tailor reports to specific stakeholders, ensuring relevant information reaches the right audience.",
      icon: "fi fi-sr-newspaper",
    },
  ];

  const sharedAnswer =
    "Attendees can submit their feedback through the survey accessible in their account specifically when they are part of the uploaded attendance list in which they are the only ones eligible to evaluate.";

  const faqs = [
    {
      question: "How do attendees submit their feedback?",
      answer: sharedAnswer,
    },
    {
      question: "How does the feedback collection process work?",
      answer: sharedAnswer,
    },
    {
      question: "What kind of analytics does the system provide?",
      answer: sharedAnswer,
    },
    {
      question: "Can I create custom surveys for different events?",
      answer: sharedAnswer,
    },
    {
      question: "Can I share reports with other organizers or administrators?",
      answer: sharedAnswer,
    },
    {
      question: "How are the performance reports created?",
      answer: sharedAnswer,
    },
    {
      question: "Does the system support multiple users?",
      answer: sharedAnswer,
    },
    {
      question:
        "Is the system scalable for a large number of events and users?",
      answer: sharedAnswer,
    },
    {
      question: "How secure is the data collected by EventStream?",
      answer: sharedAnswer,
    },
    {
      question: "Is the platform accessible on mobile devices?",
      answer: sharedAnswer,
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const featuresSection = document.getElementById("features");
      const faqsSection = document.getElementById("faqs");
      const viewportCenter = window.scrollY + window.innerHeight / 3;

      if (faqsSection && viewportCenter >= faqsSection.offsetTop) {
        setActiveSection("faqs");
      } else if (
        featuresSection &&
        viewportCenter >= featuresSection.offsetTop
      ) {
        setActiveSection("features");
      } else {
        setActiveSection("home");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="font-sans text-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow">
        <div className="flex justify-between items-center px-4 md:px-6">
          {/* Logo */}
          <a href="#" onClick={scrollToTop} className="flex items-center cursor-pointer">
            <img
              src="/assets/logo/LOGO.png"
              alt="LVCC Logo"
              className="w-12 h-12 md:w-16 md:h-16 object-contain my-2 md:m-[15px]"
            />
            <div className="text-lg md:text-[23px] font-bold">
              <span className="text-[#1F3463]">Event</span>
              <span className="text-[#2662D9]">Stream</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-[40px] lg:space-x-[80px] text-[15px] lg:text-[17px] font-semibold text-[#09090B]">
            <a
              href="#"
              onClick={scrollToTop}
              className={`relative inline-block pb-1 text-[#09090B] after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:bg-blue-500 after:transition-all after:-translate-x-1/2 cursor-pointer ${activeSection === "home"
                ? "after:w-[60px] lg:after:w-[80px]"
                : "after:w-0 hover:after:w-[60px] lg:hover:after:w-[80px]"
                }`}
            >
              Home
            </a>
            <a
              href="#features"
              className={`relative inline-block pb-1 text-[#09090B] after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:bg-blue-500 after:transition-all after:-translate-x-1/2 ${activeSection === "features"
                ? "after:w-[60px] lg:after:w-[80px]"
                : "after:w-0 hover:after:w-[60px] lg:hover:after:w-[80px]"
                }`}
            >
              About
            </a>
            <a
              href="#faqs"
              className={`relative inline-block pb-1 text-[#09090B] after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:bg-blue-500 after:transition-all after:-translate-x-1/2 ${activeSection === "faqs"
                ? "after:w-[60px] lg:after:w-[80px]"
                : "after:w-0 hover:after:w-[60px] lg:hover:after:w-[80px]"
                }`}
            >
              FAQs
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex gap-x-2 lg:gap-x-3 text-[14px] lg:text-[18px] font-semibold">
            <Link
              to="/login"
              className="bg-white text-[#1F3463] px-4 lg:px-8 py-1 rounded-[8px] border-2 border-[#1F3463] hover:bg-blue-700 hover:text-white transition-colors"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <nav className="flex flex-col p-4 space-y-4">
              <a
                href="#"
                onClick={scrollToTop}
                className={`text-[17px] font-semibold ${activeSection === "home" ? "text-blue-600" : "text-[#09090B]"
                  }`}
              >
                Home
              </a>
              <a
                href="#features"
                onClick={handleNavClick}
                className={`text-[17px] font-semibold ${activeSection === "features"
                  ? "text-blue-600"
                  : "text-[#09090B]"
                  }`}
              >
                About
              </a>
              <a
                href="#faqs"
                onClick={handleNavClick}
                className={`text-[17px] font-semibold ${activeSection === "faqs" ? "text-blue-600" : "text-[#09090B]"
                  }`}
              >
                FAQs
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t">
                <Link
                  to="/login"
                  onClick={handleNavClick}
                  className="bg-white text-[#1F3463] px-4 py-2 rounded-[8px] border-2 border-[#1F3463] text-center font-semibold"
                >
                  Login
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-[120px] sm:pt-[140px] md:pt-[180px] text-center py-8 md:py-12 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-[#1F3463]">
          Measure. <span className="text-[#2662D9]">Analyze</span>. Improve.
        </h1>
        <p className="max-w-4xl mx-auto mb-6 md:mb-8 text-base sm:text-lg md:text-[22px] text-[#1F1F1F] px-2">
          EventStream is the premier event evaluation platform for La Verdad
          Christian College - Apalit, Pampanga, designed to streamline event
          feedback and turn student voices into campus progress.
        </p>
        <Link
          to="/login"
          className="inline-block bg-[#2662D9] text-white px-5 md:px-6 py-2 md:py-3 rounded-[15px] hover:bg-blue-700 text-base md:text-[19px] font-semibold transition-colors"
        >
          Get Started
        </Link>

        {/* Campus Carousel */}
        <CampusCarousel />
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="scroll-mt-[100px] md:scroll-mt-[120px] bg-[#1F3463] text-white py-8 md:py-12 text-center px-4"
      >
        <h2 className="max-w-xl text-3xl sm:text-4xl md:text-5xl font-bold text-center mt-4 md:mt-5 mx-auto mb-3 md:mb-4 leading-tight">
          Empowering Smarter
          <br />
          Campus Decisions
        </h2>
        <p className="text-center mb-3 text-base sm:text-lg md:text-[22px]">
          Providing a comprehensive, data-driven approach to event evaluation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-w-7xl mx-auto px-2 md:px-4 py-8 md:py-12 text-start">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-[#344773] rounded-[20px] md:rounded-[25px] p-4 md:p-6 shadow-lg hover:bg-[#3C4F8C] transition duration-300 flex flex-col gap-3 md:gap-4 min-h-[200px] md:min-h-[275px]"
            >
              <div className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] bg-white rounded-full mb-6 md:mb-12 flex items-center justify-center text-[#1F3463]">
                <i className={`${feature.icon} text-lg md:text-2xl leading-none`}></i>
              </div>
              <h3 className="text-white text-base md:text-[18px] font-bold leading-tight">
                {feature.title}
              </h3>
              <p className="text-white text-sm md:text-[15px] font-medium leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faqs"
        className="scroll-mt-[100px] md:scroll-mt-[120px] py-10 md:py-16 bg-white px-4"
      >
        <h2 className="text-3xl sm:text-4xl md:text-[50px] text-[#1F3463] font-semibold text-center mb-6 md:mb-10">
          Frequently Asked Questions
        </h2>

        <div className="max-w-7xl mx-auto">
          <div className="columns-1 md:columns-2 gap-4 md:gap-6">
            {/* Reorder: odd indices first (0,2,4,6,8), then even indices (1,3,5,7,9) for left-right layout */}
            {[...faqs.map((faq, i) => ({ faq, originalIndex: i }))]
              .sort((a, b) => {
                // Odd original indices (1,3,5...) go first in DOM = left column
                // Even original indices (0,2,4...) go second in DOM = right column
                const aIsOdd = a.originalIndex % 2 === 0;
                const bIsOdd = b.originalIndex % 2 === 0;
                if (aIsOdd && !bIsOdd) return -1;
                if (!aIsOdd && bIsOdd) return 1;
                return a.originalIndex - b.originalIndex;
              })
              .map(({ faq, originalIndex }) => (
                <div
                  key={originalIndex}
                  className={`break-inside-avoid mb-4 md:mb-6 rounded-[15px] md:rounded-[20px] shadow transition-colors duration-300 overflow-hidden ${openIndex === originalIndex
                    ? "bg-[#1F3463] text-white"
                    : "bg-[#1F3463] text-white hover:bg-blue-800 cursor-pointer"
                    }`}
                  onClick={() =>
                    setOpenIndex(
                      openIndex === originalIndex ? null : originalIndex
                    )
                  }
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between p-4 md:p-5 min-h-[70px] md:min-h-[80px]">
                    <div className="flex items-center gap-3 md:gap-4 pr-3 md:pr-4">
                      <div className="font-bold rounded-[5px] w-7 h-7 md:w-8 md:h-8 flex items-center justify-center shrink-0 text-[#1F3463] bg-white text-sm md:text-base">
                        {originalIndex + 1}
                      </div>
                      <p className="font-medium leading-snug text-sm md:text-base">
                        {faq.question}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 md:w-6 md:h-6 shrink-0 transition-transform duration-300 ${openIndex === originalIndex ? "rotate-180" : ""
                        }`}
                    />
                  </div>

                  {/* Answer Section */}
                  {openIndex === originalIndex && (
                    <div className="px-4 md:px-5 pb-4 md:pb-5 text-xs md:text-sm">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-4 md:py-6 bg-[#1F3463] border-t"></footer>
    </div>
  );
};

export default LandingPage;
