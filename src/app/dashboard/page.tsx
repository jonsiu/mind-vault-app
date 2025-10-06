import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard - Mind Vault',
  description: 'Your privacy-focused learning operating system',
};

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col">
        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">
              Welcome to Mind Vault
            </h1>
            
            {/* Three Pillar Navigation */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 dark:text-blue-400 text-xl">📚</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Library</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Your personal ebook collection with smart reading and highlighting.
                </p>
                <Link href="/library" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block text-center">
                  Browse Library
                </Link>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-green-600 dark:text-green-400 text-xl">🧠</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Knowledge Hub</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Your notes, highlights, and knowledge connections.
                </p>
                <Link href="/knowledge" className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-block text-center">
                  Open Knowledge Hub
                </Link>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-purple-600 dark:text-purple-400 text-xl">🔬</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Learning Lab</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  AI-powered learning exercises and spaced repetition.
                </p>
                <Link href="/learning" className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block text-center">
                  Enter Learning Lab
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  No recent activity yet
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
