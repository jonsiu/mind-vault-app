import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KnowledgeHubView } from '@/components/views/KnowledgeHubView';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Knowledge Hub - Mind Vault',
  description: 'Your notes, highlights, and knowledge connections',
};

export default async function KnowledgePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  return (
    <DashboardLayout>
      <div className="h-screen">
        <KnowledgeHubView />
      </div>
    </DashboardLayout>
  );
}
