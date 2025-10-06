import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LibraryView } from '@/components/views/LibraryView';

export const metadata: Metadata = {
  title: 'Library - Mind Vault',
  description: 'Your personal ebook collection',
};

export default function LibraryPage() {
  return (
    <DashboardLayout>
      <LibraryView />
    </DashboardLayout>
  );
}
