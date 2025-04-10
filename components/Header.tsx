import Image from 'next/image';

export default function Header({ onLogout }: { onLogout: () => void }) {
  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-300 bg-white shadow">
      <div className="flex items-center gap-4">
        <Image src="/images/vjti_logo.svg" alt="VJTI Logo" width={50} height={50} />
        <div>
          <h1 className="text-xl font-bold text-[#800000]">Veermata Jijabai Technological Institute</h1>
          <p className="text-sm text-gray-600">Matunga East, Mumbai, Maharashtra 400019</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Welcome, Admin</span>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
}