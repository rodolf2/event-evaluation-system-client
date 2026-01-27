const ReportDescription = ({ title = "Sample Event Evaluation Report" }) => {
  return (
    <div className="mt-10 text-center">
      {/* Big Title */}
      {/* Big Title */}
      <h1 className="text-3xl md:text-5xl font-extrabold text-black px-2">{title}</h1>

      {/* Custom underline bar */}
      <div className="mx-auto mt-4 h-2 w-3/4 max-w-[1000px] bg-[#D8D8D8] rounded"></div>

      {/* Description Text */}
      <p className="text-gray-700 mt-4 max-w-4xl mx-auto leading-relaxed text-base md:text-lg px-4">
        This evaluation report serves as a guide for the institution to
        acknowledge the impact of the said event on the welfare and enjoyment of
        the students at La Verdad Christian College – Apalit, Pampanga.
      </p>
    </div>
  );
};

export default ReportDescription;
