import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./useAuth";

const SocketContext = createContext(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, token } = useAuth();

  const connectSocket = useCallback(() => {
    // Use VITE_API_URL if set, otherwise VITE_API_BASE_URL, otherwise localhost
    const socketUrl =
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:5000";
    console.log("🔌 Connecting to WebSocket at:", socketUrl);

    const newSocket = io(socketUrl, {
      auth: {
        token: token,
      },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("🔌 Connected to WebSocket server");
      // Join user-specific room
      if (user?.id || user?._id) {
        newSocket.emit("join", user.id || user._id);
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("🔌 WebSocket connection error:", error);
    });

    setSocket(newSocket);

    return newSocket;
  }, [token, user]);

  useEffect(() => {
    if (token) {
      const newSocket = connectSocket();

      return () => {
        if (newSocket) {
          newSocket.disconnect();
          console.log("🔌 Disconnected from WebSocket server");
        }
      };
    } else {
      setSocket(null);
    }
  }, [token, connectSocket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
