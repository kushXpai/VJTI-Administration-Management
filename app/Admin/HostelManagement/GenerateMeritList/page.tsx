"use client";
import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Header from '@/app/Components/Header';
import Footer from '@/app/Components/Footer';
import jsPDF from 'jspdf';

const supabase = createClientComponentClient();

const branches = {
  'B.Tech': [
    'Civil Engineering',
    'Computer Engineering',
    'Electrical Engineering',
    'Electronics Engineering',
    'Electronics & Telecommunication',
    'Information Technology',
    'Mechanical Engineering',
    'Production Engineering',
    'Textile Technology'
  ],
  'M.Tech': [
    'Civil Engineering',
    'Computer Engineering',
    'Electrical Engineering',
    'Internet of Things (IOT)',
    'Electronics & Telecommunication',
    'Mechanical Engineering',
    'Production Engineering',
    'Project Management',
    'Technical Textile',
    'Defence Technology'
  ],
  'Diploma': [
    'Civil Engineering',
    'Electrical Engineering',
    'Electronics Engineering',
    'Mechanical Engineering',
    'Textile Manufacturers',
    'Chemical Engineering'
  ],
  'MCA': []
};

type Gender = 'Boys' | 'Girls';
type Course = keyof typeof branches;

const meritListPrimaryKeys: Record<Gender, Record<Course, string>> = {
  Boys: {
    'B.Tech': 'btech_boys',
    'M.Tech': 'mtech_boys',
    'Diploma': 'diploma_boys',
    'MCA': 'mca_boys',
  },
  Girls: {
    'B.Tech': 'btech_girls',
    'M.Tech': 'mtech_girls',
    'Diploma': 'diploma_girls',
    'MCA': 'mca_girls',
  },
};

const allCategories = [
  'OPEN', 'OBC', 'SC', 'ST', 'VJ/NT/DT', 'EWS',
  'SBC', 'PH', 'NRI', 'Defense', 'Orphan', 'Other',
];

const initialCategoryState = Object.fromEntries(allCategories.map(cat => [cat, '']));

const CourseCategoryForm: React.FC<{ gender: Gender }> = ({ gender }) => {
  const [categoryValues, setCategoryValues] = useState<{ [course: string]: { [cat: string]: string } }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pdfUrls, setPdfUrls] = useState<{ [course: string]: string }>({});
  const [generating, setGenerating] = useState<string | null>(null);
  const [branchesOpen, setBranchesOpen] = useState<{ [course: string]: boolean }>({});
  const [invalidFields, setInvalidFields] = useState<{ [course: string]: { [cat: string]: boolean } }>({});
  // Add a new state for tracking if a course has any invalid fields or all zero
  const [disableActions, setDisableActions] = useState<{ [course: string]: boolean }>({});

  useEffect(() => {
    // Fetch data for all courses for the selected gender
    const fetchData = async () => {
      setLoading(true);
      const newValues: any = {};
      const newPdfUrls: any = {};
      for (const course of Object.keys(branches) as Course[]) {
        const pk = meritListPrimaryKeys[gender][course as Course];
        if (!pk) continue;
        // Fetch merit list numbers
        const { data } = await supabase
          .from('merit_list_schema_db')
          .select('*')
          .eq('id', pk)
          .single();
        if (data) {
          newValues[course] = {};
          for (const cat of allCategories) {
            newValues[course][cat] = data[cat] ?? '';
          }
          // Try to get PDF URL from storage
          const { data: fileData } = await supabase
            .storage.from('merit_lists')
            .getPublicUrl(`${pk}.pdf`);
          if (fileData?.publicUrl) newPdfUrls[course] = fileData.publicUrl;
        } else {
          newValues[course] = { ...initialCategoryState };
        }
      }
      setCategoryValues(newValues);
      setPdfUrls(newPdfUrls);
      setLoading(false);
    };
    fetchData();
  }, [gender]);

  // Enhanced validation function
  const validateCategoryInputs = (course: string) => {
    const values = categoryValues[course] || {};
    let hasError = false;
    const invalid: { [cat: string]: boolean } = {};
    let allZero = true;
    for (const cat of allCategories) {
      if (cat === 'Other' || cat === 'Orphan') continue;
      const val = values[cat];
      if (val === undefined || val === null || val === '') {
        // Only mark as invalid if the field is empty and not all fields are empty
        invalid[cat] = false;
        continue;
      }
      if (!/^\d+$/.test(val)) {
        invalid[cat] = true;
        hasError = true;
        continue;
      }
      const num = parseInt(val, 10);
      if (num < 0) {
        invalid[cat] = true;
        hasError = true;
        continue;
      }
      invalid[cat] = false;
      if (num > 0) allZero = false;
    }
    setInvalidFields(prev => ({ ...prev, [course]: invalid }));
    setDisableActions(prev => ({ ...prev, [course]: hasError || allZero }));
    if (hasError) {
      setError('Please enter valid non-negative integer values for all categories.');
      return false;
    }
    if (allZero) {
      setError('At least one category must have a value greater than zero.');
      return false;
    }
    setError('');
    return true;
  };

  // Validate on every input change
  const handleInputChange = (course: string, cat: string, value: string) => {
    // Only allow digits
    if (value !== '' && !/^\d+$/.test(value)) return;
    setCategoryValues(prev => ({
      ...prev,
      [course]: {
        ...prev[course],
        [cat]: value,
      },
    }));
    setInvalidFields(prev => ({
      ...prev,
      [course]: {
        ...prev[course],
        [cat]: false,
      },
    }));
    setTimeout(() => validateCategoryInputs(course), 0);
  };

  // Also validate on blur for better UX
  const handleInputBlur = (course: string) => {
    validateCategoryInputs(course);
  };

  const handleSave = async (course: string) => {
    if (!validateCategoryInputs(course)) return;
    setLoading(true);
    const pk = meritListPrimaryKeys[gender][course as Course];
    const values = categoryValues[course];
    const { error } = await supabase
      .from('merit_list_schema_db')
      .upsert({ id: pk, ...values });
    setLoading(false);
    if (!error) {
      setSuccess(`${course} (${gender}) saved successfully!`);
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  // Map UI course/branch to DB course string
  const uiToDbCourseMap: Record<string, Record<string, string>> = {
    'B.Tech': {
      'Civil Engineering': 'B.Tech Degree in Civil Engineering',
      'Computer Engineering': 'B.Tech Degree in Computer Engineering',
      'Electrical Engineering': 'B.Tech Degree in Electrical Engineering',
      'Electronics Engineering': 'B.Tech Degree in Electronics Engineering',
      'Electronics & Telecommunication': 'B.Tech Degree in Electronics & Telecommunication Engineering',
      'Information Technology': 'B.Tech Degree in Information Technology',
      'Mechanical Engineering': 'B.Tech Degree in Mechanical Engineering',
      'Production Engineering': 'B.Tech Degree in Production Engineering',
      'Textile Technology': 'B.Tech Degree in Textile Technology',
    },
    'M.Tech': {
      'Civil Engineering': 'M.Tech Degree in Civil Engineering',
      'Computer Engineering': 'M.Tech Degree in Computer Engineering',
      'Electrical Engineering': 'M.Tech Degree in Electrical Engineering',
      'Internet of Things (IOT)': 'M.Tech Degree in Internet of Things (IOT)',
      'Electronics & Telecommunication': 'M.Tech Degree in Electronics & Telecommunication Engineering',
      'Mechanical Engineering': 'M.Tech Degree in Mechanical Engineering',
      'Production Engineering': 'M.Tech Degree in Production Engineering',
      'Project Management': 'M.Tech Degree in Project Management',
      'Technical Textile': 'M.Tech Degree in Technical Textile',
      'Defence Technology': 'M.Tech Degree in Defence Technology',
    },
    'Diploma': {
      'Civil Engineering': 'Diploma in Civil Engineering',
      'Electrical Engineering': 'Diploma in Electrical Engineering',
      'Electronics Engineering': 'Diploma in Electronics Engineering',
      'Mechanical Engineering': 'Diploma in Mechanical Engineering',
      'Textile Manufacturers': 'Diploma in Textile Manufacturers',
      'Chemical Engineering': 'Diploma in Chemical Engineering',
    },
    'MCA': {
      // Assuming only one value for MCA
      '': 'Master of Computer Application',
    },
  };

  // Fetch hostel applications and profiles, allocate, and generate PDF
  const handleGeneratePDF = async (course: string) => {
    if (!validateCategoryInputs(course)) return;
    setGenerating(course);
    const pk = meritListPrimaryKeys[gender][course as Course];
    const branchesList = branches[course as Course];
    let apps: any[] = [];
    let appErr: any = null;
    let branchNames: string[] = branchesList;
    if (course === 'MCA') {
      // Special handling for MCA: no branches, single course name
      const { data, error } = await supabase
        .from('hostel_applications_db')
        .select('*')
        .eq('gender', gender === 'Boys' ? 'Male' : 'Female')
        .eq('course', 'Master of Computer Application')
        .order('cet_rank', { ascending: true });
      apps = data || [];
      appErr = error;
      branchNames = ['Master of Computer Application'];
    } else {
      // 1. Fetch all applications for this gender and course group (all branches)
      const dbCourseNames = branchesList.map(branch => uiToDbCourseMap[course][branch]);
      const { data, error } = await supabase
        .from('hostel_applications_db')
        .select('*')
        .eq('gender', gender === 'Boys' ? 'Male' : 'Female')
        .in('course', dbCourseNames)
        .order('cet_rank', { ascending: true });
      apps = data || [];
      appErr = error;
    }
    if (appErr) {
      console.error('Supabase fetch error:', appErr, {
        gender: gender === 'Boys' ? 'Male' : 'Female',
        course
      });
      setGenerating(null);
      alert('Error fetching applications: ' + (appErr.message || JSON.stringify(appErr)));
      return;
    }
    // 2. Fetch all profiles for mapping
    const studentIds = (apps || []).map((a: any) => a.student_id);
    const { data: profiles } = await supabase
      .from('profiles_db')
      .select('student_id, name')
      .in('student_id', studentIds);
    const nameMap = Object.fromEntries((profiles || []).map((p: any) => [p.student_id, p.name]));
    // 3. Allocation logic
    const numbers = categoryValues[course];
    const allocated: any = {};
    for (const branch of branchNames) {
      allocated[branch] = [];
    }
    // Allocate each-branch categories (OPEN, OBC, SC, ST, VJ/NT/DT, EWS)
    for (const cat of ['OPEN', 'OBC', 'SC', 'ST', 'VJ/NT/DT', 'EWS']) {
      const max = parseInt(numbers[cat] || '0', 10);
      if (!max) continue;
      for (const branch of branchNames) {
        const dbCourse = course === 'MCA' ? 'Master of Computer Application' : uiToDbCourseMap[course][branch];
        let filtered;
        if (cat === 'VJ/NT/DT') {
          filtered = (apps || []).filter(a => ['VJ', 'NT', 'DT'].includes(a.category) && a.course === dbCourse);
        } else {
          let filterCat = cat;
          if (cat === 'OPEN') filterCat = 'General';
          filtered = (apps || []).filter(a => a.category === filterCat && a.course === dbCourse);
        }
        if (cat === 'EWS') filtered = filtered.filter(a => a.is_ews);
        filtered = filtered.filter(a => !allocated[branch].some((s: any) => s.cet_application_id === a.cet_application_id));
        // Sort by cet_rank
        filtered = filtered.sort((a, b) => a.cet_rank - b.cet_rank);
        const selected = filtered.slice(0, max);
        allocated[branch].push(...selected);
      }
    }
    // Allocate all-branch (SBC, PH, NRI, Defense): max 1 per branch, total as per input
    for (const cat of ['SBC', 'PH', 'NRI', 'Defense']) {
      const max = parseInt(numbers[cat] || '0', 10);
      if (!max) continue;
      // Gather all eligible students across all branches, sort by cet_rank
      let allEligible: any[] = [];
      for (const branch of branchNames) {
        const dbCourse = course === 'MCA' ? 'Master of Computer Application' : uiToDbCourseMap[course][branch];
        let filtered = (apps || []).filter(a => a.category === cat && a.course === dbCourse);
        if (cat === 'PH') {
          // Fix: PH should include any student with is_pwd true, regardless of category
          filtered = (apps || []).filter(a => a.is_pwd && a.course === dbCourse);
        }
        filtered = filtered.filter(a => !allocated[branch].some((s: any) => s.cet_application_id === a.cet_application_id));
        // Sort by cet_rank
        filtered = filtered.sort((a, b) => a.cet_rank - b.cet_rank);
        if (filtered.length > 0) {
          allEligible.push({ ...filtered[0], branch }); // Only 1 per branch
        }
      }
      // Sort all eligible by cet_rank and pick up to max
      allEligible = allEligible.sort((a, b) => a.cet_rank - b.cet_rank).slice(0, max);
      for (const student of allEligible) {
        allocated[student.branch].push(student);
      }
    }
    // Allocate Orphan (only 1 from all branches, lowest cet_rank)
    if (parseInt(numbers['Orphan'] || '0', 10) > 0) {
      let allOrphans: any[] = [];
      for (const branch of branchNames) {
        const dbCourse = course === 'MCA' ? 'Master of Computer Application' : uiToDbCourseMap[course][branch];
        const branchOrphans = (apps || []).filter(a => a.category === 'Orphan' && a.course === dbCourse);
        allOrphans.push(...branchOrphans);
      }
      if (allOrphans.length > 0) {
        allOrphans = allOrphans.sort((a, b) => a.cet_rank - b.cet_rank);
        const orphan = allOrphans[0];
        const branch = branchNames.find(b => (course === 'MCA' ? 'Master of Computer Application' : uiToDbCourseMap[course][b]) === orphan.course);
        // Prevent duplicate allocation
        if (branch && !allocated[branch].some((s: any) => s.cet_application_id === orphan.cet_application_id)) allocated[branch].push(orphan);
      }
    }
    // Allocate all Others (accept all)
    for (const branch of branchNames) {
      const dbCourse = course === 'MCA' ? 'Master of Computer Application' : uiToDbCourseMap[course][branch];
      const others = (apps || []).filter(a => a.category === 'Other' && a.course === dbCourse);
      // Prevent duplicate allocation
      const filteredOthers = others.filter(a => !allocated[branch].some((s: any) => s.cet_application_id === a.cet_application_id));
      allocated[branch].push(...filteredOthers);
    }
    // 4. Generate PDF (formal style)
    // Prepare data for PDF: flatten all allocated students into a single array with branch info
    const pdfRows: any[] = [];
    for (const branch of branchNames) {
      allocated[branch].forEach((a: any) => {
        // Compose category display: only show (EWS) if allocated from EWS, (PWD) if allocated from PH
        let catDisplay = a.category || '';
        let tag = '';
        // Only show (EWS) if allocated from EWS category
        if (a.category === 'EWS') tag = 'EWS';
        // Only show (PWD) if allocated from PH category
        if (a.category === 'PH') tag = 'PWD';
        if (tag) catDisplay += ` (${tag})`;
        pdfRows.push({
          branch,
          cet_rank: a.cet_rank,
          student_id: a.student_id,
          name: nameMap[a.student_id] || '',
          cet_application_id: a.cet_application_id,
          category: catDisplay,
        });
      });
    }
    // Sort by branch, then CET rank
    pdfRows.sort((a, b) => a.branch.localeCompare(b.branch) || a.cet_rank - b.cet_rank);

    // Use jsPDF to format similar to old PDF (table with headers, branch as section)
    const doc = new jsPDF();
    let y = 20;
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(128, 0, 0); // Maroon for VJTI
    doc.text(`${course} (${gender}) Hostel Merit List`, 15, y);
    y += 8;
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, y);
    y += 10;
    let currentBranch = '';
    // Define column positions for 4 columns spanning the width
    const colX = [15, 60, 110, 160]; // Start x for each column
    const colWidths = [40, 45, 45, 40]; // Widths for each column
    pdfRows.forEach((row, idx) => {
      if (row.branch !== currentBranch) {
        currentBranch = row.branch;
        y += 10;
        doc.setFillColor(230, 230, 250); // Light lavender for branch header
        doc.rect(10, y - 6, 190, 8, 'F');
        doc.setFont('times', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(80, 0, 80);
        doc.text(currentBranch, 15, y);
        y += 7;
        // Table header (no EWS column)
        doc.setFont('times', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255,255,255);
        doc.setFillColor(128, 0, 0); // Maroon
        doc.rect(10, y - 5, 190, 7, 'F');
        doc.text('CET Rank', colX[0], y);
        doc.text('Name', colX[1], y);
        doc.text('CET Application ID', colX[2], y);
        doc.text('Category', colX[3], y);
        y += 6;
      }
      // Row data
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      // Alternate row color
      if (idx % 2 === 0) {
        doc.setFillColor(245, 245, 255); // Very light blue
        doc.rect(10, y - 4, 190, 6, 'F');
      }
      doc.setTextColor(0,0,0);
      doc.text(String(row.cet_rank), colX[0], y, { maxWidth: colWidths[0] });
      doc.text(row.name || '', colX[1], y, { maxWidth: colWidths[1] });
      doc.text(row.cet_application_id || '', colX[2], y, { maxWidth: colWidths[2] });
      doc.text(row.category || '', colX[3], y, { maxWidth: colWidths[3] });
      y += 6;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    // 5. Upload PDF to Supabase Storage
    const pdfBlob = doc.output('blob');
    const { error: uploadError } = await supabase.storage
      .from('merit_lists')
      .upload(`${pk}.pdf`, pdfBlob, { upsert: true, contentType: 'application/pdf' });
    if (uploadError) {
      setGenerating(null);
      alert('Failed to upload PDF');
      return;
    }
    // 6. Get public URL (with cache-busting param)
    const { data: fileData } = await supabase.storage.from('merit_lists').getPublicUrl(`${pk}.pdf`);
    if (fileData?.publicUrl) {
      // Add cache-busting param to ensure latest PDF is loaded
      const urlWithTimestamp = fileData.publicUrl + `?t=${Date.now()}`;
      setPdfUrls(prev => ({ ...prev, [course]: urlWithTimestamp }));
    }
    // 7. Update provisional_status for all allocated students
    const cetAppIds = pdfRows.map(row => row.cet_application_id).filter(Boolean);
    if (cetAppIds.length > 0) {
      await supabase
        .from('hostel_applications_db')
        .update({ provisional_status: 'Accepted' })
        .in('cet_application_id', cetAppIds);
    }
    setGenerating(null);
    setSuccess('PDF generated and uploaded!');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className="p-4">
      {/* Floating Success/Error Prompt */}
      {(success || error) && (
        <div
          className={`fixed left-1/2 bottom-8 z-50 transform -translate-x-1/2 shadow-lg px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300
            ${success ? 'bg-green-600 text-white' : ''}
            ${error ? 'bg-red-600 text-white' : ''}
          `}
          style={{ minWidth: 300, maxWidth: 500, textAlign: 'center' }}
        >
          {success || error}
        </div>
      )}
      {Object.entries(branches).map(([course, branchList]) => {
        const showBranchesDropdown = course !== 'MCA';
        return (
          <div key={course} className={`border p-4 mb-6 shadow rounded-xl transition-all duration-300 ${branchesOpen[course] ? 'pb-8' : ''}`}> 
            <h2 className="text-xl font-bold mb-4">{course}</h2>
            <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {allCategories.map(cat => (
                <div key={cat} className="text-center">
                  <label className="block font-semibold mb-1">{cat}</label>
                  <input
                    type={cat === 'Other' ? 'text' : 'number'}
                    className={`border px-2 py-1 rounded w-full text-center ${
                      cat === 'Other' || cat === 'Orphan' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                    } ${invalidFields[course]?.[cat] ? 'border-red-500 bg-red-50' : ''}`}
                    placeholder={cat === 'Other' ? '' : 'Enter number'}
                    value={cat === 'Other' || cat === 'Orphan' ? (categoryValues[course]?.[cat] ?? '') : (categoryValues[course]?.[cat] ?? '')}
                    onChange={e =>
                      cat === 'Other' || cat === 'Orphan'
                        ? undefined
                        : handleInputChange(course, cat, e.target.value)
                    }
                    onBlur={() => handleInputBlur(course)}
                    disabled={loading || cat === 'Other' || cat === 'Orphan'}
                    readOnly={cat === 'Other' || cat === 'Orphan'}
                  />
                  {invalidFields[course]?.[cat] && (
                    <div className="text-xs text-red-600 mt-1">Invalid</div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => handleSave(course as Course)}
                className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${disableActions[course] ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={loading || disableActions[course]}
              >
                Save
              </button>
              <button
                onClick={() => handleGeneratePDF(course)}
                className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${generating === course ? 'opacity-60 cursor-not-allowed' : ''} ${disableActions[course] ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={loading || generating === course || disableActions[course]}
              >
                {generating === course ? 'Generating...' : 'Generate'}
              </button>
              <a
                href={pdfUrls[course] || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 ${!pdfUrls[course] ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
                tabIndex={!pdfUrls[course] ? -1 : 0}
                aria-disabled={!pdfUrls[course]}
              >
                View PDF
              </a>
              {showBranchesDropdown && (
                <button
                  onClick={() => setBranchesOpen((prev: { [course: string]: boolean }) => ({ ...prev, [course]: !prev[course] }))}
                  className="ml-auto flex items-center gap-2 px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-expanded={branchesOpen[course]}
                  aria-controls={`branches-table-${course}`}
                >
                  Branches
                  <svg className={`w-4 h-4 transition-transform ${branchesOpen[course] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
              )}
            </div>
            {branchList.length > 0 && branchesOpen[course] && showBranchesDropdown && (
              <div id={`branches-table-${course}`} className="mt-4 animate-fade-in">
                <table className="w-full max-w-md mx-auto border border-gray-200 rounded shadow bg-white">
                  <tbody>
                    {(() => {
                      const rows: [string, string?][] = [];
                      for (let i = 0; i < branchList.length; i += 2) {
                        rows.push([branchList[i], branchList[i + 1]]);
                      }
                      return rows.map((row, i) => (
                        <tr key={i}>
                          <td className="border px-3 py-2 text-left font-medium text-gray-700 w-1/2">{row[0]}</td>
                          <td className="border px-3 py-2 text-left font-medium text-gray-700 w-1/2">{row[1] || ''}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const NoteBlock: React.FC = () => (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 rounded shadow w-full max-w-7xl mx-auto">
    <p className="font-bold mb-2 text-yellow-800">Note:</p>
    <ul className="list-disc list-inside text-yellow-900 space-y-1">
      <li>
        These categories apply to <span className="font-semibold text-yellow-700">each branch</span>: <span className="font-semibold">OPEN, OBC, SC, ST, VJ/NT/DT, EWS</span>.
      </li>
      <li>
        These categories apply to <span className="font-semibold text-yellow-700">all branches, but maximum of 1 per branch</span>: <span className="font-semibold">SBC, PH, NRI, Defense</span>.
      </li>
      <li>
        This category applies to <span className="font-semibold text-yellow-700">all branches but 1 only</span>: <span className="font-semibold">Orphan</span>.
      </li>
      <li>
        Applications from this category need to be accepted regardless: <span className="font-semibold">Other (North East, PMSSS/J&K Migrants)</span>.
      </li>
    </ul>
  </div>
);

const TabsApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Boys' | 'Girls'>('Boys');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header rightContent={
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-[#800000]">Hostel Merit List</h1>
          <p className="text-sm text-gray-600">Admin Management Panel</p>
        </div>
      } />
      {/* Tab Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab('Boys')}
              className={`px-6 py-3 font-medium text-lg transition-colors ${
                activeTab === 'Boys'
                  ? 'bg-cyan-600 text-white border-b-2 border-cyan-600'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Boys
            </button>
            <button
              onClick={() => setActiveTab('Girls')}
              className={`px-6 py-3 font-medium text-lg transition-colors ${
                activeTab === 'Girls'
                  ? 'bg-teal-600 text-white border-b-2 border-teal-600'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Girls
            </button>
          </div>
        </div>
      </div>

      {/* Note Block */}
      <NoteBlock />

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto flex-1">
        {activeTab === 'Boys' && <CourseCategoryForm gender="Boys" />}
        {activeTab === 'Girls' && <CourseCategoryForm gender="Girls" />}
      </div>
      <Footer />
    </div>
  );
};

export default TabsApp;