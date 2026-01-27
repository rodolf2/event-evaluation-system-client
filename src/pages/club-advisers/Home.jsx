import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import ClubAdviserLayout from "../../components/club-advisers/ClubAdviserLayout";
import DashboardCard from "../../components/psas/DashboardCard";
import CalendarWidget from "../../components/psas/CalendarWidget";
import RecentActivity from "../../components/psas/RecentActivity";
import Reminders from "../../components/psas/Reminders";
import ReminderModal from "../../components/participants/ReminderModal";
import ProfileSection from "../../components/participants/ProfileSection";
import dayjs from "dayjs";
import {
  SkeletonCard,
  SkeletonDashboardCard,
} from "../../components/shared/SkeletonLoader";
import { useAuth } from "../../contexts/useAuth";

function Home() {
  const [reminders, setReminders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [modalPosition, setModalPosition] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [thumbnailUrls, setThumbnailUrls] = useState({
    analytics: null,
    reports: null,
  });
  const { token, isLoading } = useAuth();

  const fetchThumbnails = useCallback(async () => {
    if (!token) return;
    try {
      const formRes = await fetch("/api/forms/latest/id", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let formId = null;
      if (formRes.ok) {
        const formData = await formRes.json();
        formId = formData.success ? formData.data?.id : null;
      }

      const timestamp = new Date().getTime();
      const analyticsThumb = formId
        ? `/api/thumbnails/analytics-${formId}.png?t=${timestamp}&token=${token}`
        : null;
      const reportsThumb = formId
        ? `/api/thumbnails/form-${formId}.png?t=${timestamp}&token=${token}`
        : null;
      setThumbnailUrls({ analytics: analyticsThumb, reports: reportsThumb });
    } catch (err) {
      console.error("Error fetching thumbnails:", err);
    }
  }, [token]);

  const fetchReminders = useCallback(async () => {
    if (!token) return;
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
            priority: "medium",
          }),
        });
        const data = await response.json();
        if (data.success !== false) {
          toast.success("Reminder added successfully!");
          await fetchReminders();
        } else {
          toast.error(data.message || "Failed to add reminder");
        }
      } catch (error) {
        toast.error("An error occurred while adding the reminder");
        console.error("Error adding reminder:", error);
      }
    },
    [token, fetchReminders],
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
          await fetchReminders();
        }
      } catch (error) {
        console.error("Error deleting reminder:", error);
      }
    },
    [token, fetchReminders],
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

  useEffect(() => {
    fetchReminders();
    fetchThumbnails();
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [fetchThumbnails, fetchReminders]);

  return (
    <ClubAdviserLayout isModalOpen={isModalOpen} pageLoading={pageLoading}>
      {isLoading || pageLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:auto-rows-min">
            <div className="lg:col-span-2">
              <SkeletonCard
                showImage={false}
                showTitle={false}
                contentLines={6}
              />
            </div>
            <div className="lg:row-span-2">
              <SkeletonCard
                showImage={false}
                showTitle={true}
                showContent={false}
              />
            </div>
            <div className="lg:col-span-2">
              <SkeletonDashboardCard />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SkeletonCard contentLines={4} />
            </div>
            <SkeletonCard contentLines={3} />
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:auto-rows-min">
              <div className="lg:col-span-2">
                <ProfileSection />
              </div>
              <div className="lg:row-span-2">
                <CalendarWidget openModal={openModal} reminders={reminders} />
              </div>
              <div className="lg:col-span-2">
                <DashboardCard
                  image={thumbnailUrls.reports}
                  title="Event Reports"
                  buttonText="View Event Reports"
                  link="/club-adviser/reports"
                />
              </div>
            </div>
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
    </ClubAdviserLayout>
  );
}

export default Home;
