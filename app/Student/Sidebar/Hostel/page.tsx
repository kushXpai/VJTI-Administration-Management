// app/Student/Sidebar/Hostel/page.tsx

'use client';
import HostelApplication from './HostelApplication/page';

interface HostelContentProps {
  user: any;
}

export default function HostelContent({ user }: HostelContentProps) {

  if (!user) return <div>Loading user data...</div>;

  return (
    <div className="p-6 w-full">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Hostel Information</h2>
        <HostelApplication user={user} />
      </div>
    </div>
  );
}