import { cookies as nextCookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase';
import { AdminHeader } from '@/components/AdminHeader';
import { AdminSidebar } from '@/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await nextCookies();
  const supabase = createSupabaseServerClient({ cookies: cookieStore });
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-indigo-50/30">
      <AdminHeader />
      <div className="flex  h-[calc(100vh-64px)]">
        <AdminSidebar />
        <main className="p-6 w-full h-[calc(100vh-64px)] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
