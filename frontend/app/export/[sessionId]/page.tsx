'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { storage, Session } from '@/lib/storage';
import { exportToCSV } from '@/lib/csvParser';

export default function ExportPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const data = await storage.getSession(sessionId);
        if (!data) {
          router.push('/');
          return;
        }
        setSession(data);
      } catch (error) {
        console.error('Failed to load session:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      loadSession();
    }
  }, [sessionId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const icpCount = Object.values(session.classifications).filter(
    (c) => c === 'icp'
  ).length;
  const notIcpCount = Object.values(session.classifications).filter(
    (c) => c === 'not_icp'
  ).length;

  const handleExport = () => {
    exportToCSV(
      session.websites,
      session.classifications,
      session.industries,
      session.csv_filename
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-medium text-gray-900 mb-4">
            Classification Complete
          </h1>
          <p className="text-gray-600">
            You&apos;ve classified all {session.total_websites} websites
          </p>
        </div>

        {/* Summary */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white border border-gray-200 rounded p-8">
            <h2 className="text-xl font-medium text-gray-900 mb-6">
              Summary
            </h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-3xl font-medium text-blue-600 mb-1">
                  {icpCount}
                </div>
                <div className="text-sm text-gray-600">ICP</div>
              </div>
              <div>
                <div className="text-3xl font-medium text-gray-800 mb-1">
                  {notIcpCount}
                </div>
                <div className="text-sm text-gray-600">Not ICP</div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="text-center space-y-4">
          <button
            onClick={handleExport}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-all active:scale-[0.97]"
          >
            Download Classified CSV
          </button>
          <div>
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-transform active:scale-[0.97]"
            >
              Start new classification
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
