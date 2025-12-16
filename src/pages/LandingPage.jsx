import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CampusCarousel from "../components/CampusCarousel";
import { ChevronDown } from "lucide-react";

const LandingPage = () => {
  const features = [
    {
      title: "Feedback Collection",
      description:
        "Easily gather attendee insights after each events with intuitive digital surveys.",
    },
    {
      title: "Data-Driven Feedback Analysis",
      description:
        "Analyze event feedback to reveal key trends and provide insights needed to make decisions.",
    },
    {
      title: "Event Analytics",
      description:
        "Provides a performance overview of every event, tracking key metrics and overall satisfaction.",
    },
    {
      title: "Actionable Insights",
      description:
        "Translate raw data into clear, strategic recommendations for future event planning.",
    },
    {
      title: "Enhanced Student Engagement",
      description:
        "Foster a culture where every student voice contributes directly to campus improvement.",
    },
    {
      title: "Performance Reports",
      description:
        "Tailor reports to specific stakeholders, ensuring relevant information reaches the right audience.",
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

  return (
    <div className="font-sans text-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow flex justify-between items-center">
        <div className="flex items-center">
          <img
            src="/assets/logo/LOGO.png"
            alt="LVCC Logo"
            className="w-16 h-16 object-contain m-[15px]"
          />
          <div className="text-[23px] font-bold">
            <span className="text-[#1F3463]">Event</span>
            <span className="text-[#2662D9]">Stream</span>
          </div>
        </div>

        <nav className="flex items-center space-x-[80px] text-[17px] font-semibold text-[#09090B]">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`relative inline-block pb-1 text-[#09090B] after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:bg-blue-500 after:transition-all after:-translate-x-1/2 cursor-pointer ${
              activeSection === "home"
                ? "after:w-[80px]"
                : "after:w-0 hover:after:w-[80px]"
            }`}
          >
            Home
          </a>
          <a
            href="#features"
            className={`relative inline-block pb-1 text-[#09090B] after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:bg-blue-500 after:transition-all after:-translate-x-1/2 ${
              activeSection === "features"
                ? "after:w-[80px]"
                : "after:w-0 hover:after:w-[80px]"
            }`}
          >
            About
          </a>
          <a
            href="#faqs"
            className={`relative inline-block pb-1 text-[#09090B] after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:bg-blue-500 after:transition-all after:-translate-x-1/2 ${
              activeSection === "faqs"
                ? "after:w-[80px]"
                : "after:w-0 hover:after:w-[80px]"
            }`}
          >
            FAQs
          </a>
        </nav>

        <div className="flex gap-x-3 text-[18px] font-semibold mb-[5px]">
          <Link
            to="/login"
            className="bg-white text-[#1F3463] px-8 py-1 rounded-[8px] border-2 border-[#1F3463] hover:bg-blue-700 hover:text-white"
          >
            Login
          </Link>
          <button className="bg-blue-600 text-white px-4 py-1 rounded-[8px] hover:bg-blue-700 mr-[15px]">
            Guest Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-[180px] text-center py-12">
        <h1 className="text-5xl font-bold mb-6 text-[#1F3463]">
          Measure. <span className="text-[#2662D9]">Analyze</span>. Improve.
        </h1>
        <p className="max-w-4xl mx-auto mb-8 text-[22px] text-[#1F1F1F]">
          EventStream is the premier event evaluation platform for La Verdad
          Christian College - Apalit, Pampanga, designed to streamline event
          feedback and turn student voices into campus progress.
        </p>
        <button className="bg-[#2662D9] text-white px-6 py-3 rounded-[15px] hover:bg-blue-700 text-[19px] font-semibold">
          Get Started
        </button>

        {/* Campus Carousel */}
        <CampusCarousel />
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="scroll-mt-[120px] bg-[#1F3463] text-white py-8 text-center"
      >
        <h2 className="max-w-xl text-5xl font-bold text-center mt-5 mx-auto mb-4 leading-tight">
          Empowering Smarter
          <br />
          Campus Decisions
        </h2>
        <p className="text-center mb-3 text-[22px]">
          Providing a comprehensive, data-driven approach to event evaluation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 py-12 text-start">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-[#344773] rounded-[25px] p-6 shadow-lg hover:bg-[#3C4F8C] transition duration-300 flex flex-col gap-4 min-h-[275px]"
            >
              <div className="w-[50px] h-[50px] bg-white rounded-full mb-12"></div>
              <h3 className="text-white text-[18px] font-bold leading-tight">
                {feature.title}
              </h3>
              <p className="text-white text-[15px] font-medium leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="scroll-mt-[120px] py-16 bg-white">
        <h2 className="text-[50px] text-[#1F3463] font-semibold text-center mb-10">
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto px-4 items-start">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`break-inside-avoid rounded-[20px] shadow transition-colors duration-300 overflow-hidden ${
                openIndex === i
                  ? "bg-[#1F3463] text-white"
                  : "bg-[#1F3463] text-white hover:bg-blue-800 cursor-pointer"
              }`}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              {/* Header Row */}
              <div className="flex items-center justify-between p-5 min-h-[80px]">
                <div className="flex items-center gap-4 pr-4">
                  <div className="font-bold rounded-[5px] w-8 h-8 flex items-center justify-center shrink-0 text-[#1F3463] bg-white">
                    {i + 1}
                  </div>
                  <p className="font-medium leading-snug">{faq.question}</p>
                </div>
                <ChevronDown
                  className={`w-6 h-6 shrink-0 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Answer Section */}
              {openIndex === i && (
                <div className="px-5 pb-5 text-sm">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 bg-[#1F3463] border-t"></footer>
    </div>
  );
};

export default LandingPage;
