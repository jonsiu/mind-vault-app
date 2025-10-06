import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LearningLabView } from '@/components/views/LearningLabView';

export const metadata: Metadata = {
  title: 'Learning Lab - Mind Vault',
  description: 'AI-powered learning exercises and spaced repetition',
};

export default function LearningPage() {
  return (
    <DashboardLayout>
      <LearningLabView />
    </DashboardLayout>
  );
}
