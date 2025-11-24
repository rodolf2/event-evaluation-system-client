import HeaderImage from '../../assets/background-image/report_header.png';
const ReportHeader = () => {
  return (
    <div className="w-full">
      <img
        src={HeaderImage}
        alt="La Verdad Christian College Header"
        className="w-full object-cover rounded-t-lg"
      />
    </div>
  );
};


export default ReportHeader;