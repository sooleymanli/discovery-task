import { cookies as nextCookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase';
import { AdminHeader } from '@/components/AdminHeader';

export default async function AdminHome() {
    const cookieStore = await nextCookies();
    const supabase = createSupabaseServerClient({ cookies: cookieStore });
    const { data } = await supabase.auth.getUser();


    if (!data.user) {
        redirect('/admin/login');
    } else {
        redirect('/admin/dashboard');
    }

    return (
        <div>
            <div className="mx-auto max-w-6xl px-4 py-10">
                <h1 className="text-2xl font-semibold">Admin Panel</h1>
                <p className="text-indigo-900/80 mt-2">Buradan müraciətləri və məlumatları idarə edəcəksiniz.</p>
            </div>
        </div>
    );
}


