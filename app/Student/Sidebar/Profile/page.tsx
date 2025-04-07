// app/Student/Sidebar/Profile/page.tsx

'use client';

interface User {
  name: string;
  email: string;
  id: string;
  role: string;
  department: string;
  year: string;
}

interface ProfileProps {
  user: User;
}

export default function ProfileContent({ user }: ProfileProps) {
  
  if (!user) return <div>Loading user data...</div>;

  return (
    <div className="p-6 w-full">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Student Details</h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-sm text-gray-600">Student ID</p>
              <p className="font-medium">{user.id || "c4480662-38f8-42b0-8dd5-de111270855f"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium">{user.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-medium">{user.role || "student"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}