'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CsvUpload from '@/components/upload/CsvUpload';
import { storage, Session } from '@/lib/storage';

export default function HomePage() {
  const router = useRouter();
  const [existingSessions, setExistingSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const sessions = await storage.getAllSessions();
        // Filter incomplete sessions (not all websites classified)
        const incompleteSessions = sessions.filter(
          s => Object.keys(s.classifications).length < s.total_websites
        );
        setExistingSessions(incompleteSessions);
      } catch (error) {
        console.error('Failed to load sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  const handleResumeSession = (sessionId: string) => {
    router.push(`/classify/${sessionId}`);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-medium text-gray-900 mb-4">
            Procuros Tinder
          </h1>
          <p className="text-gray-600">
            Upload a CSV with website URLs to start classifying
          </p>
        </div>

        {/* Resume Session */}
        {!isLoading && existingSessions.length > 0 && (
          <div className="max-w-xl mx-auto mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Resume Previous Session
              </h2>
              <div className="space-y-3">
                {existingSessions.map((session) => (
                  <button
                    key={session.session_id}
                    onClick={() => handleResumeSession(session.session_id)}
                    className="w-full text-left p-4 bg-white border border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-[0.97]"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">
                          {session.csv_filename}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {Object.keys(session.classifications).length} of {session.total_websites} classified
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Or start a new classification below
              </p>
            </div>
          </div>
        )}

        {/* Upload Component */}
        <CsvUpload />
      </div>
    </main>
  );
}
