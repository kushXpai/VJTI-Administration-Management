// app/Student/Sidebar/Dashboard/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Dashboard from './Dashboard';

export default async function DashboardPage() {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles_db')
        .select('*')
        .eq('id', user?.id)
        .single();

    return <Dashboard user={profile} />;
}