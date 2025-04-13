// app/Admin/HostelManagement/GenerateMeritList/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Header from '@/app/Components/Header';
import Footer from '@/app/Components/Footer';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';

// Define types for our application
type Application = {
  id: string;
  course: string;
  gender: string;
  cet_rank: number;
  cet_application_id: string; // Using this for student ID
  student_name: string;
  hostel_application_status: string;
  allotment_status: string;
  // Add other relevant fields
};

// Type for storing the latest PDFs
type LatestPDFs = {
  [key: string]: {
    boys: string;
    girls: string;
  };
};

export default function MeritListPage() {
  // Initialize Supabase client
  const supabase = createClientComponentClient();

  const degrees = [
    {
      name: 'Bachelor of Technology (B.Tech)',
      specializations: [
        'Mechanical Engineering',
        'Computer Engineering',
        'Civil Engineering',
        'Production Engineering',
        'Electrical Engineering',
        'Textile Engineering',
        'Defence Technology',
      ],
    },
    {
      name: 'Master of Technology (M.Tech)',
      specializations: [
        'Mechanical Engineering',
        'Computer Engineering',
        'Civil Engineering',
        'Production Engineering',
        'Electrical Engineering',
        'Textile Engineering',
        'Defence Technology',
      ],
    },
    {
      name: 'Master of Computer Application (MCA)',
      specializations: ['MCA'],
    },
    {
      name: 'Diploma',
      specializations: ['Diploma'],
    },
  ];

  const [counts, setCounts] = useState<Record<string, Record<string, { boys: number; girls: number }>>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [latestPDFs, setLatestPDFs] = useState<LatestPDFs>({});
  
  // Fetch the latest PDFs for each course on component mount
  useEffect(() => {
    const fetchLatestPDFs = async () => {
      try {
        // Get a list of all files in the merit_lists bucket
        const { data: files, error } = await supabase
          .storage
          .from('merit_lists')
          .list();
          
        if (error) {
          console.error("Error fetching files from storage:", error);
          return;
        }
        
        if (!files || files.length === 0) return;
        
        // Create a map to store the latest PDF for each course
        const latestFiles: LatestPDFs = {};
        
        // Process all files to find the latest ones
        files.forEach(file => {
          // Parse the filename to extract course and gender
          // Format: {course}_{gender}_MeritList_{timestamp}.pdf
          const match = file.name.match(/^(.+?)_(Boys|Girls)_MeritList_(\d+)\.pdf$/);
          
          if (match) {
            const [_, course, gender, timestamp] = match;
            const genderKey = gender.toLowerCase() as 'boys' | 'girls';
            
            // Get the public URL for this file
            const { data } = supabase.storage
              .from('merit_lists')
              .getPublicUrl(file.name);
              
            const publicUrl = data?.publicUrl || '';
            
            // Initialize the course entry if it doesn't exist
            if (!latestFiles[course]) {
              latestFiles[course] = { boys: '', girls: '' };
            }
            
            // Update if this is the first file or has a newer timestamp
            const currentTimestamp = parseInt(timestamp);
            const existingUrl = latestFiles[course][genderKey];
            
            if (!existingUrl || (existingUrl && currentTimestamp > extractTimestamp(existingUrl))) {
              latestFiles[course][genderKey] = publicUrl;
            }
          }
        });
        
        setLatestPDFs(latestFiles);
        
        // Also update the pdfUrls state for immediate display
        const urlsMap: Record<string, string> = {};
        Object.entries(latestFiles).forEach(([course, pdfs]) => {
          if (pdfs.boys) urlsMap[`${course}_Boys`] = pdfs.boys;
          if (pdfs.girls) urlsMap[`${course}_Girls`] = pdfs.girls;
        });
        
        setPdfUrls(urlsMap);
      } catch (err) {
        console.error("Error in fetchLatestPDFs:", err);
      }
    };
    
    // Helper function to extract timestamp from URL
    const extractTimestamp = (url: string): number => {
      const match = url.match(/_MeritList_(\d+)\.pdf/);
      return match ? parseInt(match[1]) : 0;
    };
    
    fetchLatestPDFs();
  }, [supabase]);
  
  const handleInputChange = (degree: string, specialization: string, gender: 'boys' | 'girls', value: number) => {
    if (value >= 0) { // Ensure only non-negative values are set
      setCounts((prev) => ({
        ...prev,
        [degree]: {
          ...prev[degree],
          [specialization]: {
            ...prev[degree]?.[specialization],
            [gender]: value,
          },
        },
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only numbers, backspace, delete, tab, and arrow keys
    if (
      !/[0-9]/.test(e.key) &&
      e.key !== 'Backspace' &&
      e.key !== 'Delete' &&
      e.key !== 'Tab' &&
      e.key !== 'ArrowLeft' &&
      e.key !== 'ArrowRight'
    ) {
      e.preventDefault();
    }
  };

  // Map degree and specialization to course format in database
  const mapToDbCourse = (degree: string, specialization: string): string => {
    if (degree === 'Bachelor of Technology (B.Tech)') {
      return `BTech${specialization.replace(/\s+/g, '')}`;
    } else if (degree === 'Master of Technology (M.Tech)') {
      return `MTech${specialization.replace(/\s+/g, '')}`;
    } else if (degree === 'Master of Computer Application (MCA)') {
      return 'MCA';
    } else if (degree === 'Diploma') {
      return 'Diploma';
    }
    return '';
  };

  // Generate PDF from applications list
  const generatePDF = async (title: string, applications: Application[]): Promise<Uint8Array> => {
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();
    
    // Calculate margins and usable area
    const margin = 40;
    const usableWidth = width - 2 * margin;
    
    // Title - with improved positioning and wrapping
    const titleFontSize = 16;
    const wrappedTitle = wrapText(title, timesRomanBoldFont, titleFontSize, usableWidth);
    
    let titleY = height - margin;
    wrappedTitle.forEach((line, index) => {
      page.drawText(line, {
        x: margin,
        y: titleY - (index * (titleFontSize + 5)),
        size: titleFontSize,
        font: timesRomanBoldFont,
        color: rgb(0.5, 0, 0)
      });
    });
    
    // Date text - position it below the wrapped title
    const titleHeight = wrappedTitle.length * (titleFontSize + 5);
    const dateY = height - margin - titleHeight - 20;
    
    page.drawText(`Generated on: ${new Date().toLocaleString()}`, {
      x: margin,
      y: dateY,
      size: 10,
      font: timesRomanFont
    });
    
    // Table header - position it below the date
    const columns = ['Rank', 'Student ID', 'Name', 'CET Rank'];
    const startY = dateY - 30;
    const rowHeight = 25;
    
    // Calculate column widths proportionally to the usable width
    const colWidths = [
      Math.floor(usableWidth * 0.1),  // Rank (10%)
      Math.floor(usableWidth * 0.25), // Student ID (25%)
      Math.floor(usableWidth * 0.45), // Name (45%)
      Math.floor(usableWidth * 0.2)   // CET Rank (20%)
    ];
    
    // Draw header
    let xPos = margin;
    for (let i = 0; i < columns.length; i++) {
      page.drawText(columns[i], {
        x: xPos + 5,
        y: startY,
        size: 11,
        font: timesRomanBoldFont
      });
      xPos += colWidths[i];
    }
    
    // Draw horizontal line below header
    page.drawLine({
      start: { x: margin, y: startY - 10 },
      end: { x: margin + usableWidth, y: startY - 10 },
      thickness: 1,
      color: rgb(0, 0, 0)
    });
    
    // Calculate how many entries fit on one page
    const entriesPerPage = Math.floor((startY - margin) / rowHeight);
    let currentPage = 0;
    
    // Draw rows with pagination
    applications.forEach((app, index) => {
      // Check if we need a new page
      if (index > 0 && index % entriesPerPage === 0) {
        currentPage++;
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        
        // Add title to new page
        newPage.drawText(`${title} (continued)`, {
          x: margin,
          y: height - margin,
          size: titleFontSize,
          font: timesRomanBoldFont,
          color: rgb(0.5, 0, 0)
        });
        
        // Add header to new page
        let xPos = margin;
        for (let i = 0; i < columns.length; i++) {
          newPage.drawText(columns[i], {
            x: xPos + 5,
            y: height - margin - 40,
            size: 11,
            font: timesRomanBoldFont
          });
          xPos += colWidths[i];
        }
        
        // Add horizontal line below header
        newPage.drawLine({
          start: { x: margin, y: height - margin - 50 },
          end: { x: margin + usableWidth, y: height - margin - 50 },
          thickness: 1,
          color: rgb(0, 0, 0)
        });
      }
      
      // Calculate position for this row
      const pageIndex = index % entriesPerPage;
      const currentPageObj = pdfDoc.getPages()[currentPage];
      const y = currentPage === 0 
        ? startY - 10 - ((pageIndex + 1) * rowHeight)
        : height - margin - 60 - (pageIndex * rowHeight);
      
      // Draw rank (index+1)
      currentPageObj.drawText((index + 1).toString(), {
        x: margin + 5,
        y: y + 5,
        size: 10,
        font: timesRomanFont
      });
      
      // Draw student ID (using cet_application_id)
      currentPageObj.drawText(app.cet_application_id?.toString() || 'N/A', {
        x: margin + colWidths[0] + 5,
        y: y + 5,
        size: 10,
        font: timesRomanFont
      });
      
      // Draw student name - truncate if too long
      const nameText = app.student_name?.toString() || 'N/A';
      const truncatedName = truncateText(nameText, timesRomanFont, 10, colWidths[2] - 10);
      
      currentPageObj.drawText(truncatedName, {
        x: margin + colWidths[0] + colWidths[1] + 5,
        y: y + 5,
        size: 10,
        font: timesRomanFont
      });
      
      // Draw CET rank
      currentPageObj.drawText(app.cet_rank.toString(), {
        x: margin + colWidths[0] + colWidths[1] + colWidths[2] + 5,
        y: y + 5,
        size: 10,
        font: timesRomanFont
      });
      
      // Draw horizontal line below row
      currentPageObj.drawLine({
        start: { x: margin, y: y - 5 },
        end: { x: margin + usableWidth, y: y - 5 },
        thickness: 0.5,
        color: rgb(0.5, 0.5, 0.5)
      });
    });
    
    return await pdfDoc.save();
  };

  // Helper function to wrap text
  const wrapText = (text: string, font: any, fontSize: number, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      // Try adding the word to the current line
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      
      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        // Line is too long, start a new line
        lines.push(currentLine);
        currentLine = word;
      }
    });
    
    // Add the last line
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  };

  // Helper function to truncate text if needed
  const truncateText = (text: string, font: any, fontSize: number, maxWidth: number): string => {
    if (font.widthOfTextAtSize(text, fontSize) <= maxWidth) {
      return text;
    }
    
    // Text is too long, truncate
    let truncated = text;
    while (font.widthOfTextAtSize(truncated + '...', fontSize) > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    
    return truncated + '...';
  };

  // Handle generation of merit list
  const handleGenerate = async (degree: string) => {
    try {
      setLoading({ ...loading, [degree]: true });
      setError(null);
      
      const specializations = degrees.find(d => d.name === degree)?.specializations || [];
      const courseData: Record<string, { boys: Application[], girls: Application[] }> = {};
      
      // Process each specialization if it has a count > 0
      for (const specialization of specializations) {
        const boysCount = counts[degree]?.[specialization]?.boys || 0;
        const girlsCount = counts[degree]?.[specialization]?.girls || 0;
        
        // Skip if both counts are 0
        if (boysCount === 0 && girlsCount === 0) continue;
        
        // Map to database course format
        const dbCourse = mapToDbCourse(degree, specialization);
        
        // First, fetch applications for this course
        const { data: applications, error: fetchError } = await supabase
          .from('hostel_applications')
          .select('*')
          .eq('hostel_application_status', 'Accepted')
          .eq('course', dbCourse)
          .order('cet_rank', { ascending: true });
          
        if (fetchError) {
          throw new Error(`Error fetching applications: ${fetchError.message}`);
        }

        if (!applications || applications.length === 0) {
          console.log(`No applications found for ${dbCourse}`);
          continue;
        }

        // Create enhanced applications array with student names
        const enhancedApplications: Application[] = [];
        
        // Fetch student names for each application
        for (const app of applications) {
          try {
            // Fetch the profile data using the id from hostel_applications
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', app.id)
              .single();
              
            if (profileError) {
              console.error(`Error fetching profile for ID ${app.id}:`, profileError);
              
              // Add application with default name if profile fetch fails
              enhancedApplications.push({
                ...app,
                student_name: 'Name not found'
              });
            } else {
              // Add application with fetched name
              enhancedApplications.push({
                ...app,
                student_name: profileData?.name || 'Name not found'
              });
            }
          } catch (err) {
            console.error(`Error processing application ${app.id}:`, err);
            
            // Add application with error name if something goes wrong
            enhancedApplications.push({
              ...app,
              student_name: 'Error retrieving name'
            });
          }
        }
        
        // Group by gender
        const maleApps = enhancedApplications.filter(app => app.gender === 'Male').slice(0, boysCount);
        const femaleApps = enhancedApplications.filter(app => app.gender === 'Female').slice(0, girlsCount);
        
        courseData[specialization] = {
          boys: maleApps,
          girls: femaleApps
        };
        
        // Generate and save PDFs for each gender if applications exist
        if (maleApps.length > 0) {
          const pdfBytes = await generatePDF(`${degree} - ${specialization} - Boys Merit List`, maleApps);
          const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          
          // Use a standardized filename for consistency
          const timestamp = Date.now();
          const fileName = `${dbCourse}_Boys_MeritList_${timestamp}.pdf`;
          
          // Upload to Supabase
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('merit_lists')
            .upload(fileName, pdfBlob);
            
          if (uploadError) {
            throw new Error(`Error uploading PDF: ${uploadError.message}`);
          }
          
          // Get public URL for download
          const { data: urlData } = await supabase.storage
            .from('merit_lists')
            .getPublicUrl(fileName);
            
          const publicUrl = urlData?.publicUrl || '';
          
          // Update the URLs state
          setPdfUrls(prev => ({ ...prev, [`${dbCourse}_Boys`]: publicUrl }));
          
          // Update the latest PDFs state
          setLatestPDFs(prev => ({
            ...prev,
            [dbCourse]: {
              ...prev[dbCourse],
              boys: publicUrl
            }
          }));
          
          // Update allotment status for selected applications
          for (const app of maleApps) {
            await supabase
              .from('hostel_applications')
              .update({ allotment_status: 'Accepted' })
              .eq('id', app.id);
          }
        }
        
        if (femaleApps.length > 0) {
          const pdfBytes = await generatePDF(`${degree} - ${specialization} - Girls Merit List`, femaleApps);
          const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          
          // Use a standardized filename for consistency
          const timestamp = Date.now();
          const fileName = `${dbCourse}_Girls_MeritList_${timestamp}.pdf`;
          
          // Upload to Supabase
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('merit_lists')
            .upload(fileName, pdfBlob);
            
          if (uploadError) {
            throw new Error(`Error uploading PDF: ${uploadError.message}`);
          }
          
          // Get public URL for download
          const { data: urlData } = await supabase.storage
            .from('merit_lists')
            .getPublicUrl(fileName);
            
          const publicUrl = urlData?.publicUrl || '';
          
          // Update the URLs state
          setPdfUrls(prev => ({ ...prev, [`${dbCourse}_Girls`]: publicUrl }));
          
          // Update the latest PDFs state
          setLatestPDFs(prev => ({
            ...prev,
            [dbCourse]: {
              ...prev[dbCourse],
              girls: publicUrl
            }
          }));
          
          // Update allotment status for selected applications
          for (const app of femaleApps) {
            await supabase
              .from('hostel_applications')
              .update({ allotment_status: 'Accepted' })
              .eq('id', app.id);
          }
        }
      }
      
      console.log(`Generated merit lists for ${degree}:`, courseData);
      
    } catch (err) {
      console.error('Error generating merit list:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading({ ...loading, [degree]: false });
    }
  };

  // Open PDF in new tab
  const handleViewPDF = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 space-y-10">
      <Header
        rightContent={
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-[#800000]">Hostel Merit List</h1>
            <p className="text-sm text-gray-600">Admin Management Panel</p>
          </div>
        }
      />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {degrees.map((degree) => (
        <div key={degree.name} className="border p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-[#800000] mb-4">{degree.name}</h2>
          <table className="w-full table-auto mb-4">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Specialization</th>
                <th className="p-2">Boys</th>
                <th className="p-2">Girls</th>
                <th className="p-2">View Merit Lists</th>
              </tr>
            </thead>
            <tbody>
              {degree.specializations.map((spec) => {
                const dbCourse = mapToDbCourse(degree.name, spec);
                const boysPdfUrl = pdfUrls[`${dbCourse}_Boys`];
                const girlsPdfUrl = pdfUrls[`${dbCourse}_Girls`];
                
                return (
                  <tr key={spec} className="border-t">
                    <td className="p-2">{spec}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0}
                        value={counts[degree.name]?.[spec]?.boys || ''}
                        onChange={(e) =>
                          handleInputChange(degree.name, spec, 'boys', Number(e.target.value))
                        }
                        onKeyDown={handleKeyDown}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0}
                        value={counts[degree.name]?.[spec]?.girls || ''}
                        onChange={(e) =>
                          handleInputChange(degree.name, spec, 'girls', Number(e.target.value))
                        }
                        onKeyDown={handleKeyDown}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="p-2 space-x-2">
                      {boysPdfUrl && (
                        <button
                          onClick={() => handleViewPDF(boysPdfUrl)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Boys List
                        </button>
                      )}
                      {girlsPdfUrl && (
                        <button
                          onClick={() => handleViewPDF(girlsPdfUrl)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Girls List
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button
            onClick={() => handleGenerate(degree.name)}
            disabled={loading[degree.name]}
            className={`${
              loading[degree.name] ? 'bg-gray-500' : 'bg-red-700 hover:bg-red-800'
            } text-white px-4 py-2 rounded flex items-center`}
          >
            {loading[degree.name] ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      ))}
      <Footer />
    </div>
  );
}