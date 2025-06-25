// app/Student/Sidebar/Hostel/UploadHostelFeeReceipt/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import UploadHostelFeeReceipt from './UploadHostelFeeReceipt';

export default async function DashboardPage() {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles_db')
        .select('*')
        .eq('student_id', user?.id)
        .single();

    return <UploadHostelFeeReceipt user={profile} />;
}