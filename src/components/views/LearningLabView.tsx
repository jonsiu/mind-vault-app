'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Exercise {
  id: string;
  title: string;
  type: 'cognitive' | 'kinesthetic' | 'social' | 'experiential' | 'creative';
  description: string;
  instructions: string[];
  estimatedTime: number; // in minutes
  completed: boolean;
  createdAt: string;
  dueDate?: string;
}

interface SpacedRepetitionItem {
  id: string;
  content: string;
  source: string;
  difficulty: number;
  nextReview: string;
  interval: number;
  repetitions: number;
}

export function LearningLabView() {
  const [activeTab, setActiveTab] = useState<'exercises' | 'spaced-repetition' | 'analytics'>('exercises');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [spacedRepetitionItems, setSpacedRepetitionItems] = useState<SpacedRepetitionItem[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const handleGenerateExercises = () => {
    // TODO: Implement AI exercise generation
    console.log('Generate exercises clicked');
  };

  const handleStartExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const handleCompleteExercise = (exerciseId: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, completed: true } : ex
    ));
    setSelectedExercise(null);
  };

  const getExerciseTypeIcon = (type: string) => {
    const icons = {
      cognitive: '🧠',
      kinesthetic: '🏃',
      social: '👥',
      experiential: '🌱',
      creative: '🎨'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getExerciseTypeColor = (type: string) => {
    const colors = {
      cognitive: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      kinesthetic: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      social: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      experiential: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      creative: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200'
    };
    return colors[type as keyof typeof colors] || 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200';
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Learning Lab</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              AI-powered learning exercises and spaced repetition
            </p>
          </div>
          <Button onClick={handleGenerateExercises} className="bg-purple-600 hover:bg-purple-700">
            <span className="mr-2">🤖</span>
            Generate Exercises
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'exercises', name: 'Exercises', icon: '🏃' },
              { id: 'spaced-repetition', name: 'Spaced Repetition', icon: '🔄' },
              { id: 'analytics', name: 'Analytics', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'exercises' && (
          <div>
            {exercises.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🏃</span>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  No exercises yet
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Generate personalized learning exercises based on your notes and highlights.
                </p>
                <Button onClick={handleGenerateExercises} className="bg-purple-600 hover:bg-purple-700">
                  <span className="mr-2">🤖</span>
                  Generate Your First Exercises
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getExerciseTypeIcon(exercise.type)}</span>
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-slate-100">
                            {exercise.title}
                          </h3>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getExerciseTypeColor(exercise.type)}`}>
                            {exercise.type}
                          </span>
                        </div>
                      </div>
                      {exercise.completed && (
                        <span className="text-green-600 dark:text-green-400 text-sm">✓ Completed</span>
                      )}
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3">
                      {exercise.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {exercise.estimatedTime} min
                      </span>
                      <Button
                        onClick={() => handleStartExercise(exercise)}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={exercise.completed}
                      >
                        {exercise.completed ? 'Completed' : 'Start'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'spaced-repetition' && (
          <div>
            {spacedRepetitionItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🔄</span>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  No items for review
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Create highlights and notes to start your spaced repetition journey.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <span className="mr-2">📚</span>
                  Go to Library
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {spacedRepetitionItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-slate-900 dark:text-slate-100 mb-2">
                          {item.content}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                          <span>Source: {item.source}</span>
                          <span>Difficulty: {item.difficulty}/5</span>
                          <span>Repetitions: {item.repetitions}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-blue-600 dark:text-blue-400 text-xl">📚</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Books Read</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-green-600 dark:text-green-400 text-xl">📝</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Notes Created</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-purple-600 dark:text-purple-400 text-xl">🏃</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Exercises Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-yellow-600 dark:text-yellow-400 text-xl">⏱️</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0h</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Learning Time</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {selectedExercise.title}
                </h2>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  {selectedExercise.description}
                </p>
                
                <div className="mb-4">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Instructions:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                    {selectedExercise.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Estimated time: {selectedExercise.estimatedTime} minutes
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setSelectedExercise(null)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleCompleteExercise(selectedExercise.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark Complete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
