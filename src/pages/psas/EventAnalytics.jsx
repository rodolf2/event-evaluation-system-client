import PSASLayout from "../../components/psas/PSASLayout";
import EventAnalyticsContent from "../../components/shared/EventAnalyticsContent";
import { useAuth } from "../../contexts/useAuth";
import { BarChart3 } from "lucide-react";

const EventAnalytics = () => {
  const { user } = useAuth();
  const hasPermission = user?.role === "psas" && user?.position === "PSAS Head";

  if (!hasPermission) {
    return (
      <PSASLayout>
        <div className="p-8 bg-gray-100 min-h-full flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Access Restricted
            </h2>
            <p className="text-gray-500">
              You do not have permission to view event analytics.
            </p>
          </div>
        </div>
      </PSASLayout>
    );
  }

  return (
    <PSASLayout>
      <EventAnalyticsContent basePath="/psas" />
    </PSASLayout>
  );
};

export default EventAnalytics;
