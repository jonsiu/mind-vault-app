import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LibraryView } from '@/components/views/LibraryView';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Library - Mind Vault',
  description: 'Your personal ebook collection',
};

export default async function LibraryPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  return (
    <DashboardLayout>
      <LibraryView />
    </DashboardLayout>
  );
}
