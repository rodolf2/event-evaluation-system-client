import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/useAuth";
import { useSocket } from "../../contexts/SocketContext";

import DashboardCard from "../../components/psas/DashboardCard";
import CalendarWidget from "../../components/mis/CalendarWidget";
import RecentActivity from "../../components/mis/RecentActivity";
import Reminders from "../../components/mis/Reminders";
import ReminderModal from "../../components/mis/ReminderModal";
import ProfileSection from "../../components/mis/ProfileSection";
import {
  SkeletonCard,
  SkeletonDashboardCard,
} from "../../components/shared/SkeletonLoader";
import dayjs from "dayjs";

function MisDashboard() {
  const { token, isLoading } = useAuth();
  const socket = useSocket();
  const [reminders, setReminders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [modalPosition, setModalPosition] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

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

  // Real-time listener for reminders
  useEffect(() => {
    if (socket) {
      socket.on("reminder-updated", (data) => {
        console.log("⏰ Real-time reminder update received:", data);
        fetchReminders();
      });

      return () => {
        socket.off("reminder-updated");
      };
    }
  }, [socket, fetchReminders]);

  useEffect(() => {
    fetchReminders();

    // Simulate page loading delay for consistent user experience
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [fetchReminders]);

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
          console.error("Error adding reminder:", data.message);
        }
      } catch (error) {
        toast.error("An error occurred while adding the reminder");
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
          await fetchReminders();
        }
      } catch (error) {
        console.error("Error deleting reminder:", error);
      }
    },
    [token, fetchReminders]
  );

  const updateReminder = useCallback(
    async (id, updateData) => {
      try {
        const response = await fetch(`/api/reminders/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        });
        const data = await response.json();
        if (data.success) {
          toast.success("Reminder updated successfully!");
          await fetchReminders();
        } else {
          toast.error(data.message || "Failed to update reminder");
        }
      } catch (error) {
        toast.error("An error occurred while updating the reminder");
        console.error("Error updating reminder:", error);
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
    <div className="space-y-6">
      {isLoading || pageLoading ? (
        <div className="space-y-6">
          {/* Profile, Cards & Calendar Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:auto-rows-min">
            {/* Profile Section - spans 2 columns, 1 row */}
            <div className="lg:col-span-2">
              <SkeletonCard
                showImage={false}
                showTitle={false}
                contentLines={6}
              />
            </div>
            {/* Calendar - spans 1 column, 2 rows */}
            <div className="lg:row-span-2">
              <SkeletonCard
                showImage={false}
                showTitle={true}
                showContent={false}
              />
            </div>
            {/* Cards - spans 2 columns, positioned in second row */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonDashboardCard />
              <SkeletonDashboardCard />
            </div>
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
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DashboardCard
                    title="User Roles"
                    buttonText="Go to User Roles"
                    link="/mis/user-roles"
                  />
                  <DashboardCard
                    title="Audit Logs"
                    buttonText="Go to Audit Logs"
                    link="/mis/audit-logs"
                  />
                </div>
              </div>
            </div>

            {/* Recent Activity & Reminders */}
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
            onUpdateReminder={updateReminder}
            onDeleteReminder={deleteReminder}
            reminders={reminders}
            selectedDate={selectedDate}
            position={modalPosition}
          />
        </>
      )}
    </div>
  );
}

export default MisDashboard;
