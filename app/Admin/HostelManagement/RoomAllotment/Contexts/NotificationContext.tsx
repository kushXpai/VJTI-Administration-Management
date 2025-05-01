// app/Admin/HostelManagement/RoomAllotment/Contexts/NotificationContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (message: string, type: 'success' | 'error') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    const id = Date.now(); // Unique ID based on timestamp
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Automatically remove the notification after 3 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ notifications, showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}