import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KnowledgeHubView } from '@/components/views/KnowledgeHubView';

export const metadata: Metadata = {
  title: 'Knowledge Hub - Mind Vault',
  description: 'Your notes, highlights, and knowledge connections',
};

export default function KnowledgePage() {
  return (
    <DashboardLayout>
      <div className="h-screen">
        <KnowledgeHubView />
      </div>
    </DashboardLayout>
  );
}
