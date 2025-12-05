import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import Link from 'next/link';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold">Live Meeting Notes</Link>
        <div>
          <Link href="/dashboard/new-meeting" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mr-4">New Meeting</Link>
          <form action="/auth/signout" method="post" className="inline-block">
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
              Sign Out
            </button>
          </form>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  );
}
