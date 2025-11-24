import FooterImage from "../../assets/background-image/footer.png";

// Report Footer Component
export const ReportPageFooter = () => {
  return (
    <div className="w-full">
      <img
        src={FooterImage}
        alt="Report Footer"
        className="w-full object-cover rounded-b-lg"
      />
    </div>
  );
};
