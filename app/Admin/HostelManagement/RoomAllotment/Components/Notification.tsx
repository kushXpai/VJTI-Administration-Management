// app/Admin/HostelManagement/RoomAllotment/Components/Notification.tsx
import { useNotification } from '../Contexts/NotificationContext';

export default function Notification() {
  const { notifications } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`flex items-center px-4 py-2 rounded-lg shadow-md text-white ${
            notif.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          <span>{notif.message}</span>
        </div>
      ))}
    </div>
  );
}