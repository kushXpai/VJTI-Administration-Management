
// app/Student/Sidebar/Profile/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import ProfileContent from './ProfileContent';

export default async function DashboardPage() {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.log('No user found, redirecting to login');
        return <div>Please log in to view your profile.</div>;
    }

    console.log('Fetching profile data for user:', user.id);

    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);

    console.log('Profiles data:', profiles);
    console.log('Profile error:', profileError);
    const profile = profiles?.[0];

    console.log('Fetching hostel application data...');

    const { data: hostelApplications, error: hostelError } = await supabase
        .from('hostel_applications')
        .select('*')
        .eq('id', user.id);

    console.log('Hostel applications:', hostelApplications);
    console.log('Hostel error:', hostelError);
    const hostelApplication = hostelApplications?.[0];

    if (!hostelApplication) {
        console.log('No hostel application found with id, trying user_id...');
        const { data: hostelByUserId, error: userIdError } = await supabase
            .from('hostel_applications')
            .select('*')
            .eq('user_id', user.id);
            
        console.log('Hostel by user_id:', hostelByUserId);
        console.log('User ID error:', userIdError);
        const hostelByUserIdResult = hostelByUserId?.[0];
        
        console.log('Rendering with hostelByUserIdResult');
        return <ProfileContent user={profile} hostelData={hostelByUserIdResult} />;
    }

    console.log('Rendering with hostelApplication');
    return <ProfileContent user={profile} hostelData={hostelApplication} />;
}
