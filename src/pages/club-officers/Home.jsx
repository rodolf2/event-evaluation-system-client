import { useState, useEffect, useCallback } from "react";
import { FileText, Award } from "lucide-react";
import DashboardCard from "../../components/participants/DashboardCard";
import CalendarWidget from "../../components/participants/CalendarWidget";
import RecentActivity from "../../components/participants/RecentActivity";
import Reminders from "../../components/participants/Reminders";
import ReminderModal from "../../components/participants/ReminderModal";
import ProfileSection from "../../components/participants/ProfileSection";
import {
  SkeletonGrid,
  SkeletonDashboardCard,
  SkeletonCard,
  SkeletonText,
} from "../../components/shared/SkeletonLoader";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/useAuth";
import ClubOfficerLayout from "../../components/club-officers/ClubOfficerLayout";

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
      // Get latest form ID
      const formRes = await fetch("/api/forms/latest/id", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let formId = null;
      if (formRes.ok) {
        const formData = await formRes.json();
        formId = formData.success ? formData.data?.id : null;
      } else if (formRes.status === 404) {
        // No forms found - this is expected if no forms are published yet
        formId = null;
      } else {
        console.warn(`Failed to fetch latest form: ${formRes.status}`);
      }

      // Get latest certificate ID
      const certRes = await fetch("/api/certificates/latest/id", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let certId = null;
      if (certRes.ok) {
        const certData = await certRes.json();
        certId = certData.success ? certData.data?.id : null;
      } else if (certRes.status === 404) {
        // No certificates found - this is expected if no certificates exist yet
        certId = null;
      } else {
        console.warn(`Failed to fetch latest certificate: ${certRes.status}`);
      }

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
          await fetchReminders(); // Refresh the entire list
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

  return (
    <ClubOfficerLayout pageLoading={pageLoading}>
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

          {/* Recent Activity & Reminders Skeleton */}
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
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DashboardCard
                  image={thumbnailUrls.evaluations}
                  title="My Evaluations"
                  buttonText="Go to My Evaluations"
                  link="/club-officer/evaluations/my"
                  icon={FileText}
                />
                <DashboardCard
                  image={thumbnailUrls.certificates}
                  title="My Certificates"
                  buttonText="View My Certificates"
                  link="/club-officer/certificates/my"
                  icon={Award}
                />
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
            selectedDate={selectedDate}
            position={modalPosition}
          />
        </>
      )}
    </ClubOfficerLayout>
  );
}

export default Home;
