// utils/generateRoomAllotmentPDF.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentApplication, Hostel, Mess } from '../Types/Type';

export const generateRoomAllotmentPDF = async (
  students: StudentApplication[],
  hostels: Hostel[],
  messes: Mess[]
) => {
  const doc = new jsPDF();

  // Logo (left side)
  const logo = new Image();
  logo.src = '/logo.png'; // Path from public folder
  await new Promise(resolve => {
    logo.onload = resolve;
  });
  doc.addImage(logo, 'PNG', 10, 10, 30, 30);

  // Title (centered)
  doc.setFontSize(18);
  doc.text('Room Allotment List', doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });

  const tableData = students
    .filter(s => s.room_id)
    .map((s) => {
      const name = s.profiles_db[0]?.name || 'N/A';
      const course = s.course;
      const gender = s.gender;
      const hostel = hostels.find(h => h.hostel_id === s.hostel_id)?.name || 'N/A';
      const mess = hostels.find(h => h.hostel_id === s.hostel_id)?.mess_id;
      const messName = messes.find(m => m.mess_id === mess)?.name || 'N/A';
      return [name, course, gender, hostel, messName];
    });

  autoTable(doc, {
    startY: 45,
    head: [['Name', 'Course', 'Gender', 'Hostel', 'Mess']],
    body: tableData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [128, 0, 0] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save('RoomAllotmentList.pdf');
};
