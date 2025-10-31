import { useState, useEffect, useCallback } from "react";
import PSASLayout from "../../components/psas/PSASLayout";
import DashboardCard from "../../components/psas/DashboardCard";
import CalendarWidget from "../../components/psas/CalendarWidget";
import RecentActivity from "../../components/psas/RecentActivity";
import Reminders from "../../components/psas/Reminders";
import ReminderModal from "../../components/psas/ReminderModal";
import ProfileSection from "../../components/psas/ProfileSection";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/useAuth";

function Home() {
   const [reminders, setReminders] = useState([]);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedDate, setSelectedDate] = useState(dayjs());
   const [modalPosition, setModalPosition] = useState(null);
   const [pageLoading, setPageLoading] = useState(true);
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

  useEffect(() => {
    fetchReminders();

    // Simulate page loading delay for consistent user experience
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [fetchReminders]);

  const addReminder = useCallback(async (reminder) => {
    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...reminder,
          priority: "medium" // Default priority
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
  }, [token, fetchReminders]);

  const deleteReminder = useCallback(async (id) => {
    try {
      const response = await fetch(
        `/api/reminders/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        await fetchReminders(); // Refresh the entire list
      }
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  }, [token, fetchReminders]);

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
    <PSASLayout isModalOpen={isModalOpen} pageLoading={pageLoading}>
      {isLoading || pageLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {/* Cards & Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DashboardCard
                  image="../../../thumbnails/event-analytics.png"
                  title="Event Analytics"
                  buttonText="View Event Analytics"
                />
                <DashboardCard
                  image="../../../thumbnails/event-reports.png"
                  title="Event Reports"
                  buttonText="View Event Reports"
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
    </PSASLayout>
  );
}

export default Home;
