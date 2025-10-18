import { useState, useEffect } from "react";
import PSASLayout from "../../components/psas/PSASLayout";
import DashboardCard from "../../components/psas/DashboardCard";
import CalendarWidget from "../../components/psas/CalendarWidget";
import RecentActivity from "../../components/psas/RecentActivity";
import Reminders from "../../components/psas/Reminders";
import ReminderModal from "../../components/psas/ReminderModal";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/AuthContext";

function Home() {
  const [reminders, setReminders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [modalPosition, setModalPosition] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/reminders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setReminders(data);
      } catch (error) {
        console.error("Error fetching reminders:", error);
      }
    };

    if (token) {
      fetchReminders();
    }
  }, [token]);

  const addReminder = async (reminder) => {
    try {
      const response = await fetch("http://localhost:5000/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reminder),
      });
      const newReminder = await response.json();
      setReminders([...reminders, newReminder]);
    } catch (error) {
      console.error("Error adding reminder:", error);
    }
  };

  const deleteReminder = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/reminders/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReminders(reminders.filter((reminder) => reminder._id !== id));
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
    <PSASLayout isModalOpen={isModalOpen}>
      {/* Greeting */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
        <img
          src={user?.avatar || "src/assets/users/user1.jpg"}
          alt="Profile"
          className="w-12 h-12 rounded-full"
        />
        <h2 className="text-xl font-semibold text-gray-700">
          Hi, {user?.name || "User"}!
        </h2>
      </div>

      {/* Cards & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DashboardCard
            image="src/assets/dashboard/event-analytics.jpg"
            title="Event Analytics"
            buttonText="View Event Analytics"
          />
          <DashboardCard
            image="src/assets/dashboard/event-reports.jpg"
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
      <ReminderModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onAddReminder={addReminder}
        selectedDate={selectedDate}
        position={modalPosition}
      />
    </PSASLayout>
  );
}

export default Home;
