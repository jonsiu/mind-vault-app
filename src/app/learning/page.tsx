import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LearningLabView } from '@/components/views/LearningLabView';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Learning Lab - Mind Vault',
  description: 'AI-powered learning exercises and spaced repetition',
};

export default async function LearningPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  return (
    <DashboardLayout>
      <LearningLabView />
    </DashboardLayout>
  );
}
