import { SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-slate-900 dark:bg-slate-100 rounded-lg flex items-center justify-center">
              <span className="text-slate-100 dark:text-slate-900 font-bold text-lg">M</span>
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mind Vault</span>
          </div>
          <div className="flex items-center space-x-4">
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-6 py-2 bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
                Get Started
              </button>
            </SignUpButton>
          </div>
        </header>

        {/* Hero Section */}
        <main className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Your Privacy-Focused
            <span className="block text-slate-600 dark:text-slate-400">Learning Operating System</span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Read, highlight, and learn from ebooks with AI-powered insights while maintaining complete privacy. 
            Bridge digital and physical learning with personalized exercises.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <SignUpButton mode="modal">
              <button className="px-8 py-4 bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 rounded-lg text-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
                Start Learning
              </button>
            </SignUpButton>
            <Link href="/features" className="px-8 py-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Learn More
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-blue-600 dark:text-blue-400 text-xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Smart Reading</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Read EPUB, MOBI, and PDF files with intelligent highlighting and note-taking capabilities.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-green-600 dark:text-green-400 text-xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">AI-Powered Learning</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Get personalized insights and learning exercises powered by advanced AI models.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-purple-600 dark:text-purple-400 text-xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Privacy First</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Your data stays private with end-to-end encryption and zero-knowledge architecture.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
