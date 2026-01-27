import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import ParticipantLayout from "../../components/participants/ParticipantLayout";
import DashboardCard from "../../components/participants/DashboardCard";
import CalendarWidget from "../../components/participants/CalendarWidget";
import RecentActivity from "../../components/participants/RecentActivity";
import Reminders from "../../components/participants/Reminders";
import ReminderModal from "../../components/participants/ReminderModal";
import {
  SkeletonCard,
  SkeletonDashboardCard,
} from "../../components/shared/SkeletonLoader";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/useAuth";

function ParticipantDashboard() {
  const { token, isLoading } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [modalPosition, setModalPosition] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [thumbnailUrls, setThumbnailUrls] = useState({
    evaluations: null,
    certificates: null,
  });

  // Fetch reminders -------------------------------------------------------
  const fetchReminders = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/reminders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  }, [token]);

  // Fetch latest thumbnails ------------------------------------------------
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

      // Add cache-busting timestamp to ensure fresh thumbnails
      const timestamp = new Date().getTime();
      const evalThumb = formId
        ? `/api/thumbnails/form-${formId}.png?t=${timestamp}&token=${token}`
        : null;
      const certThumb = certId
        ? `/api/thumbnails/certificate-${certId}.png?t=${timestamp}&token=${token}`
        : null;
      setThumbnailUrls({ evaluations: evalThumb, certificates: certThumb });
    } catch (err) {
      console.error("Error fetching thumbnails:", err);
    }
  }, [token]);

  // Initial load ----------------------------------------------------------
  useEffect(() => {
    fetchReminders();
    fetchThumbnails();
    const timer = setTimeout(() => setPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [fetchReminders, fetchThumbnails]);

  // Reminder CRUD ----------------------------------------------------------
  const addReminder = async (reminder) => {
    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...reminder, priority: "medium" }),
      });
      const data = await response.json();
      if (data.success !== false) {
        toast.success("Reminder added successfully!");
        await fetchReminders();
      } else {
        toast.error(data.message || "Failed to add reminder");
        console.error("Error adding reminder:", data.message);
      }
    } catch (error) {
      toast.error("An error occurred while adding the reminder");
      console.error("Error adding reminder:", error);
    }
  };

  const deleteReminder = async (id) => {
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        await fetchReminders();
      }
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

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
        <div className="space-y-6">
          {/* Cards & Calendar Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonDashboardCard />
              <SkeletonDashboardCard />
            </div>
            <SkeletonCard
              showImage={false}
              showTitle={true}
              showContent={false}
            />
          </div>

          {/* Activity & Reminders Skeleton */}
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
            {/* Cards & Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DashboardCard
                  image={thumbnailUrls.evaluations}
                  title="My Evaluations"
                  buttonText="Go to My Evaluations"
                  link="/student/evaluations"
                />
                <DashboardCard
                  image={thumbnailUrls.certificates}
                  title="My Certificates"
                  buttonText="View My Certificates"
                  link="/student/certificates"
                />
              </div>
              <CalendarWidget openModal={openModal} reminders={reminders} />
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

export default ParticipantDashboard;
