import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
import { Student } from '../types/studentTypes';
import { INSTITUTION_DETAILS } from '../constants/idCardConstants';

export const cmToPoints = (cm: number) => cm * 28.35;

// Load an image from Supabase Storage into the PDF
async function loadImageForPdf(pdf: PDFDocument, photoUrl: string) {
  try {
    if (photoUrl.includes('/images/default-avatar.png')) {
      return null;
    }

    const urlWithCacheBust = `${photoUrl}?t=${Date.now()}`;
    const res = await fetch(urlWithCacheBust, {
      mode: 'cors',
      cache: 'no-cache',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
    }

    const bytes = await res.arrayBuffer();
    const contentType = res.headers.get('Content-Type');

    if (contentType?.includes('image/png')) {
      return await pdf.embedPng(bytes);
    } else if (contentType?.includes('image/jpeg') || contentType?.includes('image/jpg')) {
      return await pdf.embedJpg(bytes);
    }

    try {
      return await pdf.embedJpg(bytes);
    } catch {
      return await pdf.embedPng(bytes);
    }
  } catch (error) {
    console.error(`Error loading image from ${photoUrl}:`, error);
    return null;
  }
}

// Draw one ID card
async function drawCard(
  page: PDFPage,
  pdf: PDFDocument,
  student: Student,
  x: number,
  y: number,
  boldFont: any,
  normalFont: any,
  logoImage: any
) {
  const cardW = cmToPoints(15.5);
  const cardH = cmToPoints(10.5);

  // Border
  page.drawRectangle({
    x,
    y,
    width: cardW,
    height: cardH,
    borderWidth: 1.5,
    borderColor: rgb(0, 0, 0),
  });

  // Logo & Header
  if (logoImage) {
    page.drawImage(logoImage, {
      x: x + cmToPoints(0.5),
      y: y + cardH - cmToPoints(1.5),
      width: cmToPoints(1.4),
      height: cmToPoints(1.4),
    });
  }

  page.drawText(INSTITUTION_DETAILS.name, {
    x: x + cmToPoints(2),
    y: y + cardH - cmToPoints(0.7),
    size: 11,
    font: boldFont,
  });

  page.drawText(INSTITUTION_DETAILS.address, {
    x: x + cmToPoints(2),
    y: y + cardH - cmToPoints(1.1),
    size: 11,
    font: normalFont,
  });

  page.drawText(INSTITUTION_DETAILS.contact, {
    x: x + cmToPoints(2),
    y: y + cardH - cmToPoints(1.5),
    size: 11,
    font: normalFont,
  });

  // Student Info
  let cursorY = y + cardH - cmToPoints(2);
  page.drawText(`Name: ${student.student_name}`, {
    x: x + cmToPoints(0.5),
    y: cursorY,
    size: 11,
    font: normalFont,
  });

  cursorY -= cmToPoints(0.5);
  page.drawText(`Programme: ${student.course}`, {
    x: x + cmToPoints(0.5),
    y: cursorY,
    size: 11,
    font: normalFont,
  });

  // Grid Table
  const tableTopY = cursorY - cmToPoints(0.5);
  const colWidths = [1.3, 2.3, 2.8, 2, 2.3].map(cmToPoints);
  const rowH = cmToPoints(0.6);
  const tableW = colWidths.reduce((a, b) => a + b, 0);
  const tableH = rowH * 9;

  let curX = x + cmToPoints(0.5);
  for (const w of colWidths) {
    page.drawLine({
      start: { x: curX, y: tableTopY },
      end: { x: curX, y: tableTopY - tableH },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    curX += w;
  }

  page.drawLine({
    start: { x: curX, y: tableTopY },
    end: { x: curX, y: tableTopY - tableH },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  for (let i = 0; i <= 9; i++) {
    const yLine = tableTopY - i * rowH;
    page.drawLine({
      start: { x: x + cmToPoints(0.5), y: yLine },
      end: { x: x + cmToPoints(0.5) + tableW, y: yLine },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
  }

  // Table Headers
  const headers = ['Sem', 'Room No.', 'Receipt No.', 'Date', 'Checked By'];
  let hdrX = x + cmToPoints(0.5);
  headers.forEach((h, i) => {
    page.drawText(h, {
      x: hdrX + 2,
      y: tableTopY - rowH + 5,
      size: 9,
      font: boldFont,
    });
    hdrX += colWidths[i];
  });

  // Semester Numbers
  for (let i = 0; i < 8; i++) {
    const ry = tableTopY - (i + 2) * rowH + 5;
    page.drawText(String(i + 1), {
      x: x + cmToPoints(0.5) + colWidths[0] / 2 - 3,
      y: ry,
      size: 9,
      font: normalFont,
    });
  }

  // Address
  const addrY = tableTopY - tableH - cmToPoints(0.5);
  page.drawText(`Address (Native Place): ${student.present_address_line1 || ''}`, {
    x: x + cmToPoints(0.5),
    y: addrY,
    size: 9,
    font: normalFont,
  });

  page.drawText(`${student.present_address_line2 || ''}`, {
    x: x + cmToPoints(4.0),
    y: addrY - cmToPoints(0.5),
    size: 9,
    font: normalFont,
  });

  page.drawText(`${student.present_state || ''}, ${student.present_city || ''}, ${student.present_pin_code || ''}`, {
    x: x + cmToPoints(4.0),
    y: addrY - cmToPoints(0.9),
    size: 9,
    font: normalFont,
  });

  page.drawText(`Contact No. of Guardian: ${student.guardian_contact || ''}`, {
    x: x + cmToPoints(0.5),
    y: addrY - cmToPoints(1.2),
    size: 9,
    font: normalFont,
  });

  // Photo
  const pW = cmToPoints(2.5), pH = cmToPoints(3);
  const pX = x + cardW - cmToPoints(3), pY = y + cardH - cmToPoints(4.2);
  const photoImg = await loadImageForPdf(pdf, student.photo_url);

  if (photoImg) {
    page.drawImage(photoImg, { x: pX, y: pY, width: pW, height: pH });
  } else {
    console.warn(`Failed to load photo for student ${student.student_name}. Skipping photo.`);
  }

  // Signature & Contact
  page.drawLine({
    start: { x: pX, y: pY - cmToPoints(2) },
    end: { x: pX + pW, y: pY - cmToPoints(2) },
    thickness: 0.5,
  });

  page.drawText('Signature', {
    x: pX + cmToPoints(0.7),
    y: pY - cmToPoints(2.3),
    size: 8,
    font: normalFont,
  });

  page.drawText(`Contact No.\n${student.contact_number}`, {
    x: pX,
    y: pY - cmToPoints(3.5),
    size: 9,
    font: normalFont,
    lineHeight: 10,
  });

  page.drawLine({
    start: { x: pX, y: pY - cmToPoints(5.0) },
    end: { x: pX + pW, y: pY - cmToPoints(5.0) },
    thickness: 0.8,
  });

  page.drawText('Chief Rector', {
    x: pX + cmToPoints(0.4),
    y: pY - cmToPoints(5.5),
    size: 8,
    font: normalFont,
  });

  page.drawText(' Signature', {
    x: pX + cmToPoints(0.4),
    y: pY - cmToPoints(5.8),
    size: 8,
    font: normalFont,
  });
}

// Main PDF generation function
export const generateIDCardPDF = async (students: Student[]) => {
  const pdf = await PDFDocument.create();
  const logo = await loadImageForPdf(pdf, INSTITUTION_DETAILS.logoUrl);
  const bf = await pdf.embedFont(StandardFonts.HelveticaBold);
  const nf = await pdf.embedFont(StandardFonts.Helvetica);

  const A4W = cmToPoints(21), A4H = cmToPoints(29.7);
  const cardH = cmToPoints(8.5);
  const xOff = (A4W - cmToPoints(17)) / 2;

  for (let i = 0; i < students.length; i += 2) {
    const page = pdf.addPage([A4W, A4H]);
    await drawCard(page, pdf, students[i], xOff, A4H - cardH - cmToPoints(3), bf, nf, logo);

    if (i + 1 < students.length) {
      await drawCard(page, pdf, students[i + 1], xOff, cmToPoints(3), bf, nf, logo);
    }
  }

  return pdf.save();
};
