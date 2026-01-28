'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { usePreloader } from '@/hooks/usePreloader';
import { storage, Session } from '@/lib/storage';
import { exportToCSV } from '@/lib/csvParser';
import WebsiteViewer from '@/components/classification/WebsiteViewer';
import ProgressBar from '@/components/classification/ProgressBar';
import Controls from '@/components/classification/Controls';

export default function ClassifyPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Load session from IndexedDB
  useEffect(() => {
    const loadSession = async () => {
      const sessionData = await storage.getSession(sessionId);
      if (!sessionData) {
        router.push('/');
        return;
      }
      setSession(sessionData);
    };

    loadSession();
  }, [sessionId, router]);

  // Preload next websites
  const websites = session?.websites || [];
  const currentIndex = session?.current_index || 0;
  usePreloader(websites.map(w => w.url), currentIndex, 10);

  // Check if all websites are classified
  useEffect(() => {
    if (session && session.current_index >= session.total_websites) {
      // All done, navigate to export page
      router.push(`/export/${sessionId}`);
    }
  }, [session, sessionId, router]);

  // Classification handlers
  const handleClassify = async (classification: 'icp' | 'not_icp') => {
    if (!session) return;

    const website = session.websites[currentIndex];
    if (!website) return;

    // Update session in IndexedDB
    const updatedSession = await storage.classify(
      sessionId,
      website.id,
      classification
    );
    setSession(updatedSession);
  };

  const handleUndo = async () => {
    if (!session || session.classification_history.length === 0) return;

    // Update session in IndexedDB
    const updatedSession = await storage.undo(sessionId);
    setSession(updatedSession);

    setToast('Undid classification');
    setTimeout(() => setToast(null), 2000);
  };

  // Keyboard navigation
  useKeyboardNavigation({
    onLeft: () => handleClassify('not_icp'),
    onRight: () => handleClassify('icp'),
    onUndo: handleUndo,
    enabled: !!session,
  });

  if (!session || currentIndex >= websites.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const currentWebsite = websites[currentIndex];
  const classifiedCount = Object.keys(session.classifications).length;

  const handleDownload = () => {
    exportToCSV(
      session.websites,
      session.classifications,
      session.csv_filename
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-medium text-gray-900">
            ICP Classification
          </h1>
          <div className="flex items-center gap-6">
            <ProgressBar current={classifiedCount} total={session.total_websites} />
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Download CSV
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-8 py-4">
        <div className="max-w-7xl mx-auto w-full mb-4" style={{ height: 'calc(100vh - 280px)' }}>
          <WebsiteViewer
            url={currentWebsite.url}
            className="h-full rounded"
          />
        </div>

        {/* Controls */}
        <div className="max-w-7xl mx-auto w-full">
          <Controls
            currentUrl={currentWebsite.url}
            onLeft={() => handleClassify('not_icp')}
            onRight={() => handleClassify('icp')}
            onUndo={handleUndo}
            canUndo={session.classification_history.length > 0}
          />
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
