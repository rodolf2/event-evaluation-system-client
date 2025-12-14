import api from "../api";

/**
 * Guest Access API Functions
 */

// Generate guest access tokens from CSV
export const generateGuestTokens = async (csvFile, eventId) => {
  try {
    const formData = new FormData();
    formData.append("csvFile", csvFile);
    formData.append("eventId", eventId);

    const response = await api.post("/api/guest/generate-tokens", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error generating guest tokens:", error);
    throw error;
  }
};

// Validate guest access token
export const validateGuestToken = async (token) => {
  try {
    const response = await api.post("/api/guest/validate-token", { token });
    return response.data;
  } catch (error) {
    console.error("Error validating guest token:", error);
    throw error;
  }
};

// Get guest access details
export const getGuestAccessDetails = async (token) => {
  try {
    const response = await api.get(`/api/guest/access-details?token=${token}`);
    return response.data;
  } catch (error) {
    console.error("Error getting guest access details:", error);
    throw error;
  }
};

// Revoke guest access token
export const revokeGuestToken = async (token) => {
  try {
    const response = await api.post("/api/guest/revoke-token", { token });
    return response.data;
  } catch (error) {
    console.error("Error revoking guest token:", error);
    throw error;
  }
};

// Get all guest access tokens for an event
export const getEventGuestTokens = async (eventId) => {
  try {
    const response = await api.get(
      `/api/guest/event-tokens?eventId=${eventId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting event guest tokens:", error);
    throw error;
  }
};
