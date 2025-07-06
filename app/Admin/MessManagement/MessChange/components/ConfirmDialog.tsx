import { Student } from "../types/student";
// Ensure MessOption is correctly imported or remove this line if not needed
import { MessOption } from "../types/student"; // Update the path to the correct module exporting MessOption

interface ConfirmDialogProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedStudent: Student | null;
  newMessId: string | null;
  messOptions: MessOption[];
  loading: boolean;
}

export default function ConfirmDialog({ show, onClose, onConfirm, selectedStudent, newMessId, messOptions, loading }: ConfirmDialogProps) {
  if (!show || !selectedStudent) return null;

  const newMessName = messOptions.find(m => m.id === newMessId)?.name || "N/A";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Confirm Mess Change</h2>
        <div className="space-y-3">
          <p><span className="font-semibold">✅ Current Mess:</span> {selectedStudent.mess_name || "N/A"}</p>
          <p><span className="font-semibold">✅ New Mess (selected):</span> {newMessName}</p>
          <p><span className="font-semibold">✅ Student Info:</span> {selectedStudent.name} (ID: {selectedStudent.student_id}, CET: {selectedStudent.cet_application_id})</p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#6B7280] rounded-md text-[#6B7280] hover:bg-[#4B5563] hover:text-white"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#7C0A02] text-white rounded-md hover:bg-[#5E0701]"
            disabled={loading}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}