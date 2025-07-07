// app/Student/Sidebar/Hostel/HostelApplication/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import HostelApplication from './HostelApplication';

export default async function DashboardPage() {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles_db')
        .select('*')
        .eq('student_id', user?.id)
        .single();

    return <HostelApplication user={profile} />;
}