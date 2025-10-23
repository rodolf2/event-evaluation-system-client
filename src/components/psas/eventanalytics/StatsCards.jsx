import totalAttendeesIcon from "../../../assets/icons/total_event_attendess-icon.svg";
import totalResponseIcon from "../../../assets/icons/total_response-icon.svg";
import remainingNonResponseIcon from "../../../assets/icons/remaining_non_responses-icon.svg";

const StatsCards = ({ totalAttendees, totalResponses, remainingNonResponses }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        className=" text-white p-4 rounded-lg shadow-md relative"
        style={{ background: "linear-gradient(180deg, #002474, #324BA3)" }}
      >
        <div className="absolute top-4 left-4">
          <img
            src={totalAttendeesIcon}
            alt="Total Event Attendees"
            className="w-6 h-6 opacity-80"
          />
        </div>
        <h2 className="text-lg font-semibold pl-10">
          Total Event Attendees
        </h2>
        <p className="text-4xl font-bold mt-1">{totalAttendees}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md relative">
        <div className="absolute top-4 left-4">
          <img
            src={totalResponseIcon}
            alt="Total Responses"
            className="w-6 h-6"
          />
        </div>
        <h2 className="text-lg font-semibold text-[#002474] pl-10">
          Total Responses
        </h2>
        <p className="text-4xl font-bold text-[#002474] mt-1">
          {totalResponses}
        </p>
      </div>
      <div
        className=" text-white p-4 rounded-lg shadow-md relative"
        style={{ background: "linear-gradient(180deg, #002474, #324BA3)" }}
      >
        <div className="absolute top-4 left-4">
          <img
            src={remainingNonResponseIcon}
            alt="Remaining Non-Responses"
            className="w-6 h-6 opacity-80"
          />
        </div>
        <h2 className="text-lg font-semibold pl-10">
          Remaining Non-Responses
        </h2>
        <p className="text-4xl font-bold mt-1">{remainingNonResponses}</p>
      </div>
    </div>
  );
};

export default StatsCards;