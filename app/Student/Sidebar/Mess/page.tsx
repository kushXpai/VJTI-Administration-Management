// app/Student/Sidebar/Mess/page.tsx

'use client';

export default function MessContent() {
  return (
    <div className="p-6 w-full">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Mess Information</h2>

        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="font-medium">Current Mess Subscription</p>
            <p className="text-sm text-green-600 mt-1">Active (Paid till June 30, 2023)</p>
          </div>

          <h3 className="font-medium mb-4">Today's Menu (April 5, 2025)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Breakfast (7:30 AM - 9:30 AM)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Poha</li>
                <li>Bread & Butter</li>
                <li>Boiled Eggs</li>
                <li>Tea/Coffee</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Lunch (12:00 PM - 2:00 PM)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Rice</li>
                <li>Dal</li>
                <li>Mixed Vegetable</li>
                <li>Chapati</li>
                <li>Salad</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Snacks (4:30 PM - 5:30 PM)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Samosa</li>
                <li>Tea</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Dinner (7:30 PM - 9:30 PM)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Rice</li>
                <li>Dal Fry</li>
                <li>Paneer Curry</li>
                <li>Chapati</li>
                <li>Sweet (Gulab Jamun)</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button className="px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#660000]">
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}