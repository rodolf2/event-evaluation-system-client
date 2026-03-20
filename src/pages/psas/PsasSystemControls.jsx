import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/useAuth";
import {
  Globe,
  FileText,
  Users,
  RefreshCw,
  Save,
  Database,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import calendar from "dayjs/plugin/calendar";
import { SkeletonBase } from "../../components/shared/SkeletonLoader";
import ConfirmationModal from "../../components/shared/ConfirmationModal";

dayjs.extend(relativeTime);
dayjs.extend(calendar);

const PsasSystemControls = () => {
  const { token, currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // -- SECURITY / SESSIONS STATE --
  const [sessions, setSessions] = useState([]);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Verify Role Access
  if (
    currentUser?.position !== "PSAS Head" &&
    currentUser?.position !== "Assistant Department Head" &&
    currentUser?.position !== "MIS Head"
  ) {
    // Fallback if accessed directly by unauthorized user (though sidebar hides it)
  }

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [sessionsRes] = await Promise.all([
        fetch("/api/mis/security/sessions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const sessionsData = await sessionsRes.json();

      // 1. Settings logic removed as per design changes
      // 1. Sessions
      if (sessionsData.success) {
        setSessions(
          sessionsData.data.map((s) => ({
            ...s,
            lastAccess: s.lastAccess ? dayjs(s.lastAccess).fromNow() : "Never",
            expiresAt: dayjs(s.expiresAt).calendar(null, {
              sameDay: "[Today at] h:mm A",
              nextDay: "[Tomorrow at] h:mm A",
              nextWeek: "dddd [at] h:mm A",
              lastDay: "[Yesterday at] h:mm A",
              lastWeek: "[Last] dddd [at] h:mm A",
              sameElse: "MMM D, YYYY h:mm A",
            }),
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching system data:", error);
      toast.error("Failed to load system configuration");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS: SESSIONS ---
  const handleRevokeSession = (session) => {
    setSessionToRevoke(session);
    setShowRevokeConfirm(true);
  };

  const confirmRevoke = async () => {
    if (!sessionToRevoke) return;

    setIsRevoking(true);
    try {
      const response = await fetch(
        `/api/mis/security/sessions/${sessionToRevoke.id}/revoke`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        toast.success("Session revoked");
        setShowRevokeConfirm(false);
        setSessionToRevoke(null);
        fetchData(); // Refresh all
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to revoke session");
      }
    } catch {
      toast.error("Error revoking session");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER REMOVED as per request */}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          {/* NLP Engine Card Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <div className="flex items-start gap-3 mb-1">
              <SkeletonBase className="w-6 h-6 rounded mt-1" />
              <div className="space-y-2 flex-1">
                <SkeletonBase className="h-6 w-48 rounded" />
                <SkeletonBase className="h-4 w-full max-w-sm rounded" />
              </div>
            </div>

            <div className="mt-6 bg-gray-50/50 rounded-xl p-4 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <div className="flex items-center gap-4">
                <SkeletonBase className="w-12 h-12 rounded-xl" />
                <div className="space-y-2">
                  <SkeletonBase className="h-5 w-40 rounded" />
                  <SkeletonBase className="h-3 w-32 rounded opacity-50" />
                </div>
              </div>
              <SkeletonBase className="h-6 w-16 rounded-full" />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <div className="space-y-2">
                <SkeletonBase className="h-5 w-36 rounded" />
                <SkeletonBase className="h-4 w-64 rounded opacity-50" />
              </div>
              <SkeletonBase className="h-10 w-full sm:w-auto rounded-xl" />
            </div>
          </div>

          {/* Active Sessions Card Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
              <div className="flex items-center gap-3">
                <SkeletonBase className="w-5 h-5 rounded" />
                <SkeletonBase className="h-6 w-44 rounded" />
              </div>
              <SkeletonBase className="w-8 h-8 rounded-lg self-end sm:self-auto" />
            </div>
            <div className="p-0 sm:p-6 space-y-0 sm:space-y-4 divide-y divide-gray-100 sm:divide-y-0">
              <div className="hidden sm:flex justify-between border-b border-gray-100 pb-4 px-6 sm:px-0 pt-6 sm:pt-0">
                {[...Array(5)].map((_, i) => (
                  <SkeletonBase
                    key={i}
                    className="h-4 w-20 rounded opacity-50"
                  />
                ))}
              </div>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row justify-between sm:items-center py-4 px-6 sm:p-0 gap-3 sm:gap-0"
                >
                  <div className="flex justify-between sm:block">
                    <SkeletonBase className="w-10 sm:hidden h-4 rounded opacity-50" />
                    <SkeletonBase className="h-5 w-32 rounded" />
                  </div>
                  <div className="flex justify-between sm:block">
                    <SkeletonBase className="w-8 sm:hidden h-4 rounded opacity-50" />
                    <SkeletonBase className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="flex justify-between sm:block">
                    <SkeletonBase className="w-16 sm:hidden h-4 rounded opacity-50" />
                    <SkeletonBase className="h-5 w-24 rounded" />
                  </div>
                  <div className="flex justify-between sm:block">
                    <SkeletonBase className="w-20 sm:hidden h-4 rounded opacity-50" />
                    <SkeletonBase className="h-5 w-24 rounded" />
                  </div>
                  <div className="flex justify-between sm:block sm:justify-end">
                    <SkeletonBase className="w-12 sm:hidden h-4 rounded opacity-50" />
                    <SkeletonBase className="h-5 w-16 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* NLP Engine Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <div className="flex items-start gap-3 mb-1">
              <FileText className="w-6 h-6 text-gray-700 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  NLP & Sentiment Engine
                </h2>
                <p className="text-gray-500 text-sm">
                  Manage TextBlob dictionaries for student feedback analysis.
                </p>
              </div>
            </div>

            {/* Dictionary Status Selection (Visual only as per design) */}
            <div className="mt-6 bg-gray-50/50 rounded-xl p-4 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100/50 rounded-xl flex items-center justify-center shrink-0">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">
                    Internal Dictionary v1.0.0
                  </div>
                  <div className="text-xs text-gray-500">
                    Last updated: 1/6/2026 by System
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                Active
              </span>
            </div>

            {/* Lexicon Management Footer */}
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <div>
                <div className="font-bold text-gray-800">
                  Lexicon Management
                </div>
                <p className="text-sm text-gray-500">
                  Manage the list of words used for sentiment analysis.
                </p>
              </div>
              <Link
                to="/psas/lexicon-management"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors w-full sm:w-auto"
              >
                <BookOpen className="w-5 h-5" />
                Manage Words
              </Link>
            </div>
          </div>
          {/* Active Sessions Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">
                  Active Guest Sessions
                </h3>
              </div>
              <button
                onClick={fetchData}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 self-end sm:self-auto"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full block sm:table">
                <thead className="bg-gray-50/50 border-b border-gray-100 hidden sm:table-header-group">
                  <tr className="block sm:table-row">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Access Expires
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 block sm:table-row-group">
                  {sessions.length === 0 ? (
                    <tr className="block sm:table-row">
                      <td
                        colSpan="5"
                        className="block sm:table-cell px-6 py-8 text-center text-gray-500"
                      >
                        No active sessions found
                      </td>
                    </tr>
                  ) : (
                    sessions.map((s) => (
                      <tr
                        key={s.id}
                        className="hover:bg-gray-50/50 transition-colors block sm:table-row py-4 sm:py-0"
                      >
                        <td className="flex sm:table-cell justify-between items-center sm:items-start px-6 py-2 sm:py-4">
                          <span className="sm:hidden text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            User
                          </span>
                          <div className="font-medium text-gray-900 text-right sm:text-left">
                            {s.userName}
                          </div>
                        </td>
                        <td className="flex sm:table-cell justify-between items-center sm:items-start px-6 py-2 sm:py-4">
                          <span className="sm:hidden text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Role
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 block sm:inline-block">
                            {s.role}
                          </span>
                        </td>
                        <td className="flex sm:table-cell justify-between items-center sm:items-start px-6 py-2 sm:py-4 text-sm text-gray-500">
                          <span className="sm:hidden text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Last Active
                          </span>
                          <span className="text-right sm:text-left">
                            {s.lastAccess}
                          </span>
                        </td>
                        <td className="flex sm:table-cell justify-between items-center sm:items-start px-6 py-2 sm:py-4 text-sm text-blue-600 font-medium">
                          <span className="sm:hidden text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Access Expires
                          </span>
                          <span className="text-right sm:text-left">
                            {s.expiresAt}
                          </span>
                        </td>
                        <td className="flex sm:table-cell justify-between items-center sm:items-start px-6 py-2 sm:py-4 text-right">
                          <span className="sm:hidden text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Action
                          </span>
                          <button
                            onClick={() => handleRevokeSession(s)}
                            className="text-red-600 hover:text-red-700 hover:underline text-sm font-medium ml-auto sm:ml-0"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Modal for Revocation */}
      <ConfirmationModal
        isOpen={showRevokeConfirm}
        onClose={() => {
          if (!isRevoking) {
            setShowRevokeConfirm(false);
            setSessionToRevoke(null);
          }
        }}
        onConfirm={confirmRevoke}
        title="Revoke Guest Access"
        message={`Are you sure you want to revoke access for ${sessionToRevoke?.name}? They will be immediately blocked from viewing the ${sessionToRevoke?.role === "Speaker" ? "report" : "evaluation form"}.`}
        confirmText="Revoke Access"
        cancelText="Keep Access"
        isDestructive={true}
        isLoading={isRevoking}
      />
    </div>
  );
};

export default PsasSystemControls;
