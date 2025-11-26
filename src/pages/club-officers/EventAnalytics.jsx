import ClubOfficerLayout from "../../components/club-officers/ClubOfficerLayout";
import EventAnalyticsContent from "../../components/shared/EventAnalyticsContent";

const EventAnalytics = () => {
  return (
    <ClubOfficerLayout>
      <EventAnalyticsContent basePath="/club-officer" />
    </ClubOfficerLayout>
  );
};

export default EventAnalytics;
