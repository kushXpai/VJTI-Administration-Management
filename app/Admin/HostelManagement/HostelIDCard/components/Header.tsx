'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const router = useRouter();

  const goBack = () => {
    router.push('/Admin/AdminDashboard');
  };

  return (
    <header className="flex justify-between items-center p-5 border-b border-gray-300 bg-white shadow">
      <div className="flex items-center gap-5">
        <Image src="/images/vjti_logo.svg" alt="VJTI Logo" width={50} height={50} />
        <div>
          <h1 className="text-2xl font-bold text-[#800000] leading-tight">
            Veermata Jijabai Technological Institute
          </h1>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>
      <button
        onClick={goBack}
        className="px-5 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md shadow-md transition-colors duration-200"
      >
        Back to Dashboard
      </button>
    </header>
  );
}
