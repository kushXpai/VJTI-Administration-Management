// app/Admin/HostelManagement/GenerateMeritList/page.tsx
"use client";

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Header from '@/app/Components/Header';
import Footer from '@/app/Components/Footer';
import DegreeForm from './components/DegreeForm';
import { Application, CountsType } from './types/hostelTypes';
import { generatePDF } from './utils/pdfUtils';
import { degreesData, mapToDbCourse } from './utils/courseUtils';

export default function MeritListPage() {
  const supabase = createClientComponentClient();
  const [counts, setCounts] = useState<CountsType>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (degree: string, specialization: string, gender: 'boys' | 'girls', value: number) => {
    if (value >= 0) {
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

  const allocateByCategory = async (applications: Application[], maxCount: number) => {
    // Category-wise limits
    const categoryLimits = {
      General: 4,
      OBC: 2,
      SC: 1,
      ST: 1,
      VJNTDT: 1, // Combined limit for VJ, NT, and DT
    };

    // Sort applications by CET rank
    applications.sort((a, b) => a.cet_rank - b.cet_rank);

    // Group applications by category
    const categoryGroups: Record<string, Application[]> = {
      General: [],
      OBC: [],
      SC: [],
      ST: [],
      VJNTDT: [],
    };

    // Group applications into categories
    for (const app of applications) {
      // First, fetch the student's name from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', app.id)
        .single();

      const appWithName = {
        ...app,
        student_name: profileData?.name || 'N/A'
      };

      if (app.category === 'VJ' || app.category === 'NT' || app.category === 'DT') {
        categoryGroups['VJNTDT'].push(appWithName);
      } else {
        categoryGroups[app.category].push(appWithName);
      }
    }

    // Allocate students from each category
    const allocated: Application[] = [];
    Object.entries(categoryLimits).forEach(([category, limit]) => {
      const categoryApps = categoryGroups[category];
      // Sort again within each category by CET rank
      categoryApps.sort((a, b) => a.cet_rank - b.cet_rank);
      allocated.push(...categoryApps.slice(0, limit));
    });

    // Handle EWS allocation (1 seat)
    const ewsCandidates = applications.filter(app =>
      app.is_ews && !allocated.includes(app)
    );

    if (ewsCandidates.length > 0) {
      // Sort EWS candidates by CET rank
      ewsCandidates.sort((a, b) => a.cet_rank - b.cet_rank);
      // First try from General category
      const ewsFromGeneral = ewsCandidates.filter(app => app.category === 'General');
      if (ewsFromGeneral.length > 0) {
        allocated.push(ewsFromGeneral[0]);
      } else {
        // If no General category EWS candidates, take from any category
        allocated.push(ewsCandidates[0]);
      }
    }

    // Final sort of allocated students by CET rank
    allocated.sort((a, b) => a.cet_rank - b.cet_rank);

    // Ensure we don't exceed the maximum count
    return allocated.slice(0, maxCount);
  };

  const handleGenerate = async (degree: string) => {
    try {
      setLoading({ ...loading, [degree]: true });
      setError(null);

      const specializations = degreesData.find(d => d.name === degree)?.specializations || [];
      const boysApplications: Application[] = [];
      const girlsApplications: Application[] = [];

      // Process each specialization
      for (const specialization of specializations) {
        const boysCount = counts[degree]?.[specialization]?.boys || 0;
        const girlsCount = counts[degree]?.[specialization]?.girls || 0;

        if (boysCount === 0 && girlsCount === 0) continue;

        const dbCourse = mapToDbCourse(degree, specialization);

        // Fetch applications for this course
        const { data: applications, error: fetchError } = await supabase
          .from('hostel_applications')
          .select('*')
          .eq('hostel_application_status', 'Accepted')
          .eq('course', dbCourse)
          .order('cet_rank', { ascending: true });

        if (fetchError) throw new Error(`Error fetching applications: ${fetchError.message}`);
        if (!applications || applications.length === 0) continue;

        // Split by gender and allocate
        const maleApps = await allocateByCategory(
          applications.filter(app => app.gender === 'Male'),
          boysCount
        );
        const femaleApps = await allocateByCategory(
          applications.filter(app => app.gender === 'Female'),
          girlsCount
        );

        boysApplications.push(...maleApps.map(app => ({ ...app, specialization })));
        girlsApplications.push(...femaleApps.map(app => ({ ...app, specialization })));
      }

      // Sort final lists by CET rank
      boysApplications.sort((a, b) => a.cet_rank - b.cet_rank);
      girlsApplications.sort((a, b) => a.cet_rank - b.cet_rank);

      // Generate PDFs
      if (boysApplications.length > 0) {
        const boysPdf = await generatePDF(`${degree} - Boys Merit List`, boysApplications);
        const boysBlob = new Blob([boysPdf], { type: 'application/pdf' });
        const timestamp = Date.now();
        const boysFileName = `${degree.replace(/[^a-zA-Z0-9]/g, '')}_Boys_MeritList_${timestamp}.pdf`;

        const { error: uploadError } = await supabase.storage
          .from('merit_lists')
          .upload(boysFileName, boysBlob);

        if (uploadError) throw new Error(`Error uploading boys PDF: ${uploadError.message}`);

        const { data: urlData } = await supabase.storage
          .from('merit_lists')
          .getPublicUrl(boysFileName);

        setPdfUrls(prev => ({
          ...prev,
          [`${degree}_Boys`]: urlData?.publicUrl || '',
        }));
      }

      if (girlsApplications.length > 0) {
        const girlsPdf = await generatePDF(`${degree} - Girls Merit List`, girlsApplications);
        const girlsBlob = new Blob([girlsPdf], { type: 'application/pdf' });
        const timestamp = Date.now();
        const girlsFileName = `${degree.replace(/[^a-zA-Z0-9]/g, '')}_Girls_MeritList_${timestamp}.pdf`;

        const { error: uploadError } = await supabase.storage
          .from('merit_lists')
          .upload(girlsFileName, girlsBlob);

        if (uploadError) throw new Error(`Error uploading girls PDF: ${uploadError.message}`);

        const { data: urlData } = await supabase.storage
          .from('merit_lists')
          .getPublicUrl(girlsFileName);

        setPdfUrls(prev => ({
          ...prev,
          [`${degree}_Girls`]: urlData?.publicUrl || '',
        }));
      }

      // Update allotment status for selected applications
      const allApplications = [...boysApplications, ...girlsApplications];
      for (const app of allApplications) {
        await supabase
          .from('hostel_applications')
          .update({ allotment_status: 'Allotted' })
          .eq('id', app.id);
      }

    } catch (err) {
      console.error('Error generating merit list:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading({ ...loading, [degree]: false });
    }
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

      {degreesData.map((degree) => (
        <DegreeForm
          key={degree.name}
          degree={degree}
          counts={counts}
          pdfUrls={pdfUrls}
          loading={loading}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          handleGenerate={handleGenerate}
        />
      ))}
      <Footer />
    </div>
  );
}