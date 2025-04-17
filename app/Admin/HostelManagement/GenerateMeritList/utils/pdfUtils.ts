// utils/pdfUtils.ts

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Application, PDFFont } from '../types/hostelTypes';

export const generatePDF = async (title: string, applications: Application[]): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const pageWidth = 595.28; // A4 width
  const pageHeight = 841.89; // A4 height
  const margin = 40;
  const usableWidth = pageWidth - 2 * margin;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;

  // Draw title and date
  const titleFontSize = 16;
  const wrappedTitle = wrapText(title, timesRomanBoldFont, titleFontSize, usableWidth);
  wrappedTitle.forEach((line, index) => {
    currentPage.drawText(line, {
      x: margin,
      y: currentY - index * (titleFontSize + 5),
      size: titleFontSize,
      font: timesRomanBoldFont,
      color: rgb(0.5, 0, 0)
    });
  });

  currentY -= wrappedTitle.length * (titleFontSize + 5) + 20;

  // Draw date
  currentPage.drawText(`Generated on: ${new Date().toLocaleString()}`, {
    x: margin,
    y: currentY,
    size: 10,
    font: timesRomanFont
  });
  currentY -= 30;

  // Group applications by specialization
  const specializationGroups = applications.reduce((groups: Record<string, Application[]>, app) => {
    const spec = app.specialization || 'Unknown';
    if (!groups[spec]) groups[spec] = [];
    groups[spec].push(app);
    return groups;
  }, {});

  // Process each specialization
  for (const [specialization, apps] of Object.entries(specializationGroups)) {
    // Sort all applications by CET rank
    apps.sort((a, b) => a.cet_rank - b.cet_rank);

    // Add new page if needed
    if (currentY < margin + 100) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - margin;
    }

    // Draw specialization header
    currentPage.drawText(specialization, {
      x: margin,
      y: currentY,
      size: 14,
      font: timesRomanBoldFont,
      color: rgb(0, 0, 0.5)
    });
    currentY -= 20;

    // Table headers
    const columns = ['Rank', 'Student ID', 'Name', 'CET Rank', 'Category', 'EWS'];
    const colWidths = [
      Math.floor(usableWidth * 0.1),  // Rank
      Math.floor(usableWidth * 0.2),  // Student ID
      Math.floor(usableWidth * 0.3),  // Name
      Math.floor(usableWidth * 0.15), // CET Rank
      Math.floor(usableWidth * 0.15), // Category
      Math.floor(usableWidth * 0.1)   // EWS
    ];

    // Draw column headers
    let xPos = margin;
    columns.forEach((col, index) => {
      currentPage.drawText(col, {
        x: xPos + 5,
        y: currentY,
        size: 11,
        font: timesRomanBoldFont
      });
      xPos += colWidths[index];
    });
    currentY -= 20;

    // Draw rows
    let rank = 1;
    for (const app of apps) {
      // Add new page if needed
      if (currentY < margin + 25) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
        
        // Redraw specialization and column headers on new page
        currentPage.drawText(`${specialization} (continued)`, {
          x: margin,
          y: currentY,
          size: 14,
          font: timesRomanBoldFont,
          color: rgb(0, 0, 0.5)
        });
        currentY -= 20;

        xPos = margin;
        columns.forEach((col, index) => {
          currentPage.drawText(col, {
            x: xPos + 5,
            y: currentY,
            size: 11,
            font: timesRomanBoldFont
          });
          xPos += colWidths[index];
        });
        currentY -= 20;
      }

      // Draw row data
      xPos = margin;

      // Rank
      currentPage.drawText(rank.toString(), {
        x: xPos + 5,
        y: currentY,
        size: 10,
        font: timesRomanFont
      });
      xPos += colWidths[0];

      // Student ID
      currentPage.drawText(app.cet_application_id || 'N/A', {
        x: xPos + 5,
        y: currentY,
        size: 10,
        font: timesRomanFont
      });
      xPos += colWidths[1];

      // Name
      const truncatedName = truncateText(app.student_name || 'N/A', timesRomanFont, 10, colWidths[2] - 10);
      currentPage.drawText(truncatedName, {
        x: xPos + 5,
        y: currentY,
        size: 10,
        font: timesRomanFont
      });
      xPos += colWidths[2];

      // CET Rank
      currentPage.drawText(app.cet_rank.toString(), {
        x: xPos + 5,
        y: currentY,
        size: 10,
        font: timesRomanFont
      });
      xPos += colWidths[3];

      // Category
      currentPage.drawText(app.category || 'N/A', {
        x: xPos + 5,
        y: currentY,
        size: 10,
        font: timesRomanFont
      });
      xPos += colWidths[4];

      // EWS
      currentPage.drawText(app.is_ews ? 'Yes' : 'No', {
        x: xPos + 5,
        y: currentY,
        size: 10,
        font: timesRomanFont
      });

      currentY -= 25;
      rank++;
    }

    currentY -= 30; // Add spacing between specializations
  }

  return await pdfDoc.save();
};

// Helper function to wrap text
export const wrapText = (text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);

    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

// Helper function to truncate text
export const truncateText = (text: string, font: PDFFont, fontSize: number, maxWidth: number): string => {
  if (font.widthOfTextAtSize(text, fontSize) <= maxWidth) {
    return text;
  }

  let truncated = text;
  while (font.widthOfTextAtSize(truncated + '...', fontSize) > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }

  return truncated + '...';
};