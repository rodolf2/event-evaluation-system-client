import { useState, useEffect, useCallback } from "react";
import ParticipantLayout from "../../components/participants/ParticipantLayout";
import DashboardCard from "../../components/participants/DashboardCard";
import CalendarWidget from "../../components/participants/CalendarWidget";
import RecentActivity from "../../components/participants/RecentActivity";
import Reminders from "../../components/participants/Reminders";
import ReminderModal from "../../components/participants/ReminderModal";
import ProfileSection from "../../components/participants/ProfileSection";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/useAuth";

function Home() {
  const [reminders, setReminders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [modalPosition, setModalPosition] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [thumbnailUrls, setThumbnailUrls] = useState({
    evaluations: null,
    certificates: null,
  });
  const { token, isLoading } = useAuth();

  const fetchReminders = useCallback(async () => {
    if (!token) return; // Ensure token exists before fetching
    try {
      const response = await fetch("/api/reminders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  }, [token]);

  const fetchThumbnails = useCallback(async () => {
    if (!token) return;
    try {
      // Latest form ID
      const formRes = await fetch("/api/forms/latest/id", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formData = await formRes.json();
      const formId = formData.success ? formData.data?.id : null;

      // Latest certificate ID
      const certRes = await fetch("/api/certificates/latest/id", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const certData = await certRes.json();
      const certId = certData.success ? certData.data?.id : null;

      const evalThumb = formId ? `/api/thumbnails/form-${formId}.png` : null;
      const certThumb = certId
        ? `/api/thumbnails/certificate-${certId}.png`
        : null;
      setThumbnailUrls({ evaluations: evalThumb, certificates: certThumb });
    } catch (err) {
      console.error("Error fetching thumbnails:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchReminders();
    fetchThumbnails();

    // Simulate page loading delay for consistent user experience
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [fetchReminders, fetchThumbnails]);

  const addReminder = useCallback(
    async (reminder) => {
      try {
        const response = await fetch("/api/reminders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...reminder,
            priority: "medium", // Default priority
          }),
        });
        const data = await response.json();
        if (data.success !== false) {
          await fetchReminders(); // Refresh the entire list
        } else {
          console.error("Error adding reminder:", data.message);
        }
      } catch (error) {
        console.error("Error adding reminder:", error);
      }
    },
    [token, fetchReminders]
  );

  const deleteReminder = useCallback(
    async (id) => {
      try {
        const response = await fetch(`/api/reminders/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          await fetchReminders(); // Refresh the entire list
        }
      } catch (error) {
        console.error("Error deleting reminder:", error);
      }
    },
    [token, fetchReminders]
  );

  const openModal = (date, position) => {
    setSelectedDate(date);
    setModalPosition(position);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalPosition(null);
  };

  return (
    <ParticipantLayout isModalOpen={isModalOpen} pageLoading={pageLoading}>
      {isLoading || pageLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {/* Profile, Cards & Calendar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:auto-rows-min">
              {/* Profile Section - spans 2 columns, 1 row */}
              <div className="lg:col-span-2">
                <ProfileSection />
              </div>
              {/* Calendar - spans 1 column, 2 rows */}
              <div className="lg:row-span-2">
                <CalendarWidget openModal={openModal} reminders={reminders} />
              </div>
              {/* Cards - spans 2 columns, positioned in second row */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DashboardCard
                  image={thumbnailUrls.evaluations}
                  title="My Evaluations"
                  buttonText="Go to My Evaluations"
                  link="/participant/evaluations"
                />
                <DashboardCard
                  image={thumbnailUrls.certificates}
                  title="My Certificates"
                  buttonText="View My Certificates"
                  link="/participant/certificates"
                />
              </div>
            </div>

            {/* Activity & Reminders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentActivity />
              </div>
              <Reminders reminders={reminders} onDelete={deleteReminder} />
            </div>
          </div>

          <ReminderModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onAddReminder={addReminder}
            selectedDate={selectedDate}
            position={modalPosition}
          />
        </>
      )}
    </ParticipantLayout>
  );
}

export default Home;
