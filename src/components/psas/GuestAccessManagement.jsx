import React, { useState, useCallback, useEffect } from 'react';
import {
  generateGuestTokens,
  getEventGuestTokens,
  revokeGuestToken,
} from "../../api/guestApi";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/useAuth";

const GuestAccessManagement = () => {
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [guestTokens, setGuestTokens] = useState([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Fetch events for dropdown
  const fetchEvents = useCallback(async () => {
    if (!token) return;

    setIsLoadingEvents(true);
    try {
      const response = await fetch("/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setIsLoadingEvents(false);
    }
  }, [token]);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Fetch guest tokens for selected event
  const fetchGuestTokens = useCallback(async () => {
    if (!selectedEvent || !token) return;

    setIsLoadingTokens(true);
    try {
      const data = await getEventGuestTokens(selectedEvent);
      setGuestTokens(data.tokens || []);
    } catch (error) {
      console.error("Error fetching guest tokens:", error);
      toast.error("Failed to load guest access tokens");
    } finally {
      setIsLoadingTokens(false);
    }
  }, [selectedEvent, token]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedEvent) {
      toast.error("Please select an event first");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await generateGuestTokens(file, selectedEvent);

      // Complete progress
      setUploadProgress(100);
      clearInterval(progressInterval);

      toast.success(`${result.successCount} guest access tokens generated successfully!`);
      await fetchGuestTokens(); // Refresh the token list

      // Reset file input
      e.target.value = '';
    } catch (error) {
      console.error("Error generating guest tokens:", error);
      toast.error(error.message || "Failed to generate guest tokens");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleRevokeToken = async (tokenId) => {
    try {
      await revokeGuestToken(tokenId);
      toast.success("Guest access token revoked successfully");
      await fetchGuestTokens(); // Refresh the token list
    } catch (error) {
      console.error("Error revoking token:", error);
      toast.error("Failed to revoke token");
    }
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    setGuestTokens([]); // Clear previous tokens when event changes
  };

  // Download example CSV template
  const downloadExampleCSV = () => {
    const csvContent = `event_id,guest_name,guest_email,role,reference_id,token_expiration
EVT2024001,Dr. Jane Smith,janesmith@university.edu,speaker,"Keynote: Future of Education",2025-12-31
EVT2024001,Prof. John Doe,johndoe@research.org,evaluator,FORM_EVT2024001_001,2025-12-15`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest_access_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Guest Access Management</h2>
        <button
          onClick={downloadExampleCSV}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Download Template
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event
        </label>
        <div className="relative">
          <select
            value={selectedEvent}
            onChange={handleEventChange}
            disabled={isLoadingEvents}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">Select an event</option>
            {events.map(event => (
              <option key={event._id} value={event._id}>
                {event.title} ({event.eventId})
              </option>
            ))}
          </select>
          {isLoadingEvents && (
            <div className="absolute right-3 top-2.5">
              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Guest Access CSV
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v12l-8-8-8 8V8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
              <path d="M20 12h8m-8 4h8m-8 4h8m-8 4h8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
            </svg>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading || !selectedEvent}
              className="hidden"
            />
            <span className="text-blue-600 hover:text-blue-800 font-medium">
              {isUploading ? 'Uploading...' : 'Click to upload CSV file'}
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Upload CSV file with guest speaker and evaluator information
          </p>

          {isUploading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {uploadProgress === 100 ? 'Processing complete!' : `Uploading... ${uploadProgress}%`}
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedEvent && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Active Guest Access Tokens</h3>
            <button
              onClick={fetchGuestTokens}
              disabled={isLoadingTokens}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh List
            </button>
          </div>

          {isLoadingTokens ? (
            <div className="text-center py-8">
              <svg className="animate-spin h-6 w-6 text-gray-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 mt-2">Loading guest tokens...</p>
            </div>
          ) : guestTokens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No active guest access tokens for this event.</p>
              <p className="text-sm mt-1">Upload a CSV file to generate tokens.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {guestTokens.map(token => (
                    <tr key={token._id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{token.guest_name}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{token.guest_email}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          token.role === 'speaker' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {token.role === 'speaker' ? 'Guest Speaker' : 'Guest Evaluator'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          token.access_type === 'read' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {token.access_type === 'read' ? 'View Reports' : 'Submit Evaluation'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(token.expires_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          token.is_revoked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {token.is_revoked ? 'Revoked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {!token.is_revoked && (
                          <button
                            onClick={() => handleRevokeToken(token._id)}
                            className="text-red-600 hover:text-red-800 text-xs font-medium"
                          >
                            Revoke Access
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GuestAccessManagement;
